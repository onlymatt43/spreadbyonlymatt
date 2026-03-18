"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type CabinSpread = {
  id: string;
  label: string;
  audience: "commons" | "mesh";
};

type OwnerCabinProps = {
  nodeId: string | null;
  node: {
    handle: string;
    mainLink: string;
    displayName: string;
    photoUrl: string | null;
    videoUrl: string | null;
  };
  spreads: CabinSpread[];
  vaultItems: {
    id: string;
    title: string;
    type: string;
    externalUrl: string | null;
    fileUrl: string | null;
    linkedSpreadId: string | null;
  }[];
};

export function OwnerCabin({ nodeId, node, spreads, vaultItems }: OwnerCabinProps) {
  const router = useRouter();
  const [activeSpreadId, setActiveSpreadId] = useState<string | null>(() => {
    const firstCommons = spreads.find((spread) => spread.audience === "commons");
    return firstCommons?.id ?? null;
  });
  const [items, setItems] = useState(spreads);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [publishingVaultId, setPublishingVaultId] = useState<string | null>(null);
  const [recentlyDimmedId, setRecentlyDimmedId] = useState<string | null>(null);
  const [vault, setVault] = useState(vaultItems);
  const calmTimerRef = useRef<number | null>(null);

  function markDimmed(spreadId: string | null) {
    if (calmTimerRef.current) {
      window.clearTimeout(calmTimerRef.current);
      calmTimerRef.current = null;
    }

    setRecentlyDimmedId(spreadId);

    if (spreadId) {
      calmTimerRef.current = window.setTimeout(() => {
        setRecentlyDimmedId((current) => (current === spreadId ? null : current));
        calmTimerRef.current = null;
      }, 2600);
    }
  }

  async function toggleSpread(spreadId: string) {
    const current = items.find((spread) => spread.id === spreadId);

    if (!current || pendingId) {
      return;
    }

    const nextAudience = current.audience === "mesh" ? "commons" : "mesh";
    setPendingId(spreadId);

    try {
      const response = await fetch(`/api/spreads/${spreadId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ audience: nextAudience }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update spread.");
      }

      setItems((prev) =>
        prev.map((spread) =>
          spread.id === spreadId ? { ...spread, audience: data.spread.audience } : spread
        )
      );

      setActiveSpreadId(data.spread.audience === "commons" ? spreadId : null);
      markDimmed(data.spread.audience === "mesh" ? spreadId : null);
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setPendingId(null);
    }
  }

  const orderedSpreads = useMemo(() => {
    const mesh = items.filter((spread) => spread.audience === "mesh");
    const commons = items.filter((spread) => spread.audience === "commons");
    return [...mesh, ...commons];
  }, [items]);

  async function addUploadedSpread(file: File) {
    if (!nodeId || uploadingFile) {
      return;
    }

    setUploadingFile(true);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);

      const uploadResponse = await fetch("/api/uploads", {
        method: "POST",
        body: uploadFormData,
      });
      const uploadData = await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(uploadData.error || "Upload failed.");
      }

      const vaultResponse = await fetch(`/api/node-by-id/${nodeId}/vault`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          label: file.name,
          title: file.name,
          type: file.type.startsWith("image/") || file.type.startsWith("video/") ? "media" : "document",
          fileUrl: uploadData.url,
          metaJson: {
            pathname: uploadData.pathname,
            contentType: uploadData.contentType,
          },
        }),
      });
      const vaultData = await vaultResponse.json();

      if (!vaultResponse.ok) {
        throw new Error(vaultData.error || "Failed to create vault item from upload.");
      }

      setVault((prev) => [
        {
          id: vaultData.item.id,
          title: vaultData.item.title,
          type: vaultData.item.type,
          externalUrl: vaultData.item.externalUrl,
          fileUrl: vaultData.item.fileUrl,
          linkedSpreadId: null,
        },
        ...prev,
      ]);

      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setUploadingFile(false);
    }
  }

  async function sendVaultItemToNode(itemId: string) {
    if (!nodeId || publishingVaultId) {
      return;
    }

    const item = vault.find((entry) => entry.id === itemId);

    if (!item || item.linkedSpreadId) {
      return;
    }

    setPublishingVaultId(itemId);

    try {
      const response = await fetch(`/api/node-by-id/${nodeId}/spreads`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          label: item.title,
          kind: item.externalUrl && !item.fileUrl ? "link" : "document",
          audience: "mesh",
          vaultItemId: item.id,
          externalUrl: item.externalUrl,
          fileUrl: item.fileUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to publish vault item.");
      }

      setItems((prev) => [
        ...prev,
        {
          id: data.spread.id,
          label: data.spread.label,
          audience: data.spread.audience,
        },
      ]);
      setVault((prev) =>
        prev.map((entry) =>
          entry.id === itemId ? { ...entry, linkedSpreadId: data.spread.id } : entry
        )
      );
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setPublishingVaultId(null);
    }
  }

  return (
    <div
      className={`relative min-h-[calc(100vh-73px)] overflow-hidden transition-colors duration-700 ${
        activeSpreadId ? "bg-[#0e0e0e]" : "bg-transparent"
      }`}
    >
      <div
        className={`absolute inset-0 transition-opacity duration-700 ${
          activeSpreadId ? "opacity-100" : "opacity-0"
        }`}
        style={{
          background:
            "radial-gradient(circle at center, rgba(255,255,255,0.045), transparent 46%), linear-gradient(180deg, rgba(4,4,4,0.45), rgba(4,4,4,0.72))",
        }}
      />

      <main className="relative mx-auto grid min-h-[calc(100vh-73px)] max-w-6xl gap-8 px-6 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <section className="relative order-2 lg:order-1">
          <div
            className={`absolute inset-0 translate-x-6 translate-y-6 rounded-[2.2rem] border border-white/10 bg-[#151515] transition-all duration-700 ${
              activeSpreadId ? "opacity-100" : "opacity-88"
            }`}
          />
          <div className="relative rounded-[2.2rem] border border-[var(--line)] bg-[var(--panel)] p-8 shadow-[0_20px_80px_rgba(0,0,0,0.08)]">
            <div className="relative h-56 overflow-hidden rounded-[1.6rem] bg-[linear-gradient(135deg,#fff1ae,transparent_55%),linear-gradient(180deg,#161616,#393939)]">
              {node.videoUrl ? (
                <video
                  key={node.videoUrl}
                  src={node.videoUrl}
                  className="h-full w-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              ) : node.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={node.photoUrl} alt={node.displayName} className="h-full w-full object-cover" />
              ) : null}
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,241,174,0.45),transparent_45%),linear-gradient(180deg,transparent,rgba(0,0,0,0.18))]" />
            </div>
            <div className="relative z-10 -mt-10 ml-4 mb-4">
              <div className="relative rounded-[1.4rem] border border-black/10 bg-white p-2 shadow-[0_14px_40px_rgba(0,0,0,0.14)]">
                <div className="h-22 w-22 overflow-hidden rounded-[1rem] bg-[#d9d1c3] sm:h-24 sm:w-24">
                  {node.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={node.photoUrl}
                      alt={node.handle}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xl font-semibold text-black/55">
                      {node.displayName.slice(0, 1)}
                    </div>
                  )}
                </div>
                <div className="absolute bottom-2 left-2 rounded-full bg-black/78 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-white/78 backdrop-blur-sm">
                  Node
                </div>
              </div>
            </div>
            <a
              href={node.mainLink}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex rounded-full bg-[var(--ink)] px-5 py-3 text-sm font-medium text-[var(--canvas)] transition hover:bg-[var(--accent)] hover:text-[var(--ink-strong)]"
            >
              {node.handle}
            </a>
          </div>
        </section>

        <section className="relative order-1 lg:order-2">
          <div className="rounded-[2rem] border border-white/10 bg-[#151515] p-7 text-white shadow-[0_30px_120px_rgba(0,0,0,0.35)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-white/45">Cabin</p>
                <h2 className="mt-2 text-3xl font-medium">Behind the Node</h2>
              </div>
              <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-white/45">
                Owner view
              </span>
            </div>

            <div className="mt-8">
              <p className="text-xs uppercase tracking-[0.28em] text-white/45">Spreads</p>
              <div className="mt-4 flex flex-wrap gap-3">
                {orderedSpreads.length === 0 ? (
                  <div className="rounded-full border border-white/10 px-4 py-3 text-sm text-white/55">
                    No spreads yet
                  </div>
                ) : (
                  orderedSpreads.map((spread) => {
                    const isActive = spread.audience === "commons";
                    const isPending = pendingId === spread.id;

                    return (
                      <button
                        key={spread.id}
                        type="button"
                        onClick={() => toggleSpread(spread.id)}
                        disabled={isPending}
                        className={`relative rounded-full px-4 py-3 text-sm transition-all duration-300 ${
                          isActive
                            ? "bg-white text-black shadow-[0_0_24px_rgba(255,255,255,0.5)]"
                            : recentlyDimmedId === spread.id
                              ? "bg-black text-white ring-1 ring-white/16 shadow-[0_0_22px_rgba(255,255,255,0.08)]"
                              : "bg-white/6 text-white/78 ring-1 ring-white/10 hover:bg-white/10 hover:text-white hover:ring-white/22"
                        } ${isPending ? "opacity-60" : ""}`}
                      >
                        <span className="mr-2 inline-block h-2 w-2 rounded-full bg-current align-middle opacity-80" />
                        {spread.label}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            <div className="mt-8 rounded-[1.4rem] border border-white/10 bg-black/20 p-5">
              <p className="text-xs uppercase tracking-[0.28em] text-white/45">Vault</p>
              <p className="mt-3 text-sm leading-7 text-white/58">Reserve. Send to the Node when ready.</p>
              <label className="mt-4 inline-flex cursor-pointer rounded-full border border-white/12 px-4 py-3 text-sm text-white/78 transition hover:border-white/30">
                {uploadingFile ? "Uploading..." : "Upload file"}
                <input
                  type="file"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                      void addUploadedSpread(file);
                      event.currentTarget.value = "";
                    }
                  }}
                />
              </label>
              <div className="mt-4 flex flex-col gap-3">
                {vault.length === 0 ? (
                  <div className="rounded-[1.1rem] border border-white/10 px-4 py-4 text-sm text-white/45">
                    Vault is empty.
                  </div>
                ) : (
                  vault.map((item) => {
                    const isPublished = Boolean(item.linkedSpreadId);
                    const source = item.fileUrl || item.externalUrl;

                    return (
                      <div
                        key={item.id}
                        className="flex flex-col gap-3 rounded-[1.1rem] border border-white/10 bg-white/[0.03] px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-white/45">
                              {item.type}
                            </span>
                            {isPublished ? (
                              <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-white/55">
                                In Node
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-2 truncate text-sm text-white">{item.title}</p>
                          {source ? (
                            <p className="mt-1 truncate text-xs text-white/35">{source}</p>
                          ) : null}
                        </div>
                        <button
                          type="button"
                          onClick={() => sendVaultItemToNode(item.id)}
                          disabled={isPublished || publishingVaultId === item.id}
                          className="rounded-full border border-white/12 px-4 py-2 text-sm text-white transition hover:border-white/28 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {publishingVaultId === item.id ? "Sending..." : isPublished ? "Sent" : "To Node"}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div
            className={`pointer-events-none absolute left-[-10%] top-[52%] hidden h-px w-[70%] origin-left transition-all duration-500 lg:block ${
              activeSpreadId ? "opacity-100" : "opacity-30"
            }`}
            style={{
              background:
                "linear-gradient(90deg, rgba(255,255,255,0.7), rgba(240,199,74,0.95), rgba(240,199,74,0))",
              boxShadow: activeSpreadId ? "0 0 18px rgba(240,199,74,0.6)" : "none",
            }}
          />
        </section>
      </main>
    </div>
  );
}
