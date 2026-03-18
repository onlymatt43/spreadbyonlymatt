"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SpreadKind } from "@prisma/client";

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
};

export function OwnerCabin({ nodeId, node, spreads }: OwnerCabinProps) {
  const router = useRouter();
  const [activeSpreadId, setActiveSpreadId] = useState<string | null>(null);
  const [items, setItems] = useState(spreads);
  const [newSpreadLabel, setNewSpreadLabel] = useState("");
  const [addingSpread, setAddingSpread] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [recentlyDimmedId, setRecentlyDimmedId] = useState<string | null>(null);
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

  async function addSpread() {
    if (!nodeId || !newSpreadLabel.trim() || addingSpread) {
      return;
    }

    setAddingSpread(true);

    try {
      const label = newSpreadLabel.trim();
      const response = await fetch(`/api/node-by-id/${nodeId}/spreads`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          label,
          kind: /^https?:\/\//i.test(label) || label.includes(".") ? "link" : "custom",
          audience: "mesh",
          externalUrl:
            /^https?:\/\//i.test(label) || label.includes(".")
              ? (/^https?:\/\//i.test(label) ? label : `https://${label}`)
              : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create spread.");
      }

      setItems((prev) => [
        {
          id: data.spread.id,
          label: data.spread.label,
          audience: data.spread.audience,
        },
        ...prev,
      ]);
      setNewSpreadLabel("");
      markDimmed(data.spread.id);
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setAddingSpread(false);
    }
  }

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

      const spreadResponse = await fetch(`/api/node-by-id/${nodeId}/spreads`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          label: file.name,
          kind:
            file.type && (file.type.startsWith("image/") || file.type.startsWith("video/"))
              ? SpreadKind.document
              : SpreadKind.document,
          audience: "mesh",
          fileUrl: uploadData.url,
        }),
      });
      const spreadData = await spreadResponse.json();

      if (!spreadResponse.ok) {
        throw new Error(spreadData.error || "Failed to create spread from upload.");
      }

      setItems((prev) => [
        {
          id: spreadData.spread.id,
          label: spreadData.spread.label,
          audience: spreadData.spread.audience,
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

  return (
    <div className="relative min-h-[calc(100vh-73px)] overflow-hidden">
      <main className="relative mx-auto grid min-h-[calc(100vh-73px)] max-w-6xl gap-8 px-6 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <section className="relative order-2 lg:order-1">
          <div className="absolute inset-0 translate-x-6 translate-y-6 rounded-[2.2rem] border border-white/10 bg-[#151515] opacity-88 transition-all duration-700" />
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

            <div className="mt-8 space-y-6">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-white/45">Add</p>
                <div className="mt-3 flex flex-wrap gap-3">
                  <input
                    value={newSpreadLabel}
                    onChange={(event) => setNewSpreadLabel(event.target.value)}
                    placeholder="Add spread"
                    className="min-w-0 flex-1 rounded-full border border-white/12 bg-black/25 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-white/30"
                  />
                  <button
                    type="button"
                    onClick={addSpread}
                    disabled={!nodeId || addingSpread || !newSpreadLabel.trim()}
                    className="flex h-12 w-12 items-center justify-center rounded-full border border-white/12 text-lg text-white transition hover:border-white/30 disabled:opacity-40"
                  >
                    {addingSpread ? "…" : "+"}
                  </button>
                  <label className="inline-flex cursor-pointer rounded-full border border-white/12 px-4 py-3 text-sm text-white/78 transition hover:border-white/30">
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
                </div>
              </div>

              <div className="rounded-[1.4rem] border border-white/10 bg-black/15 p-5">
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
            </div>
          </div>

        </section>
      </main>
    </div>
  );
}
