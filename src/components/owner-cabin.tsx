"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SpreadKind } from "@prisma/client";
import { NodeCard } from "@/components/node-card";
import { parseSpreadLink } from "@/lib/utils";

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
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [recentlyDimmedId, setRecentlyDimmedId] = useState<string | null>(null);
  const calmTimerRef = useRef<number | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");

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

  async function setAudience(spreadId: string, audience: "mesh" | "commons") {
    if (updatingId) return;
    setUpdatingId(spreadId);
    try {
      const response = await fetch(`/api/spreads/${spreadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audience }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to update audience.");
      setItems((prev) =>
        prev.map((spread) =>
          spread.id === spreadId ? { ...spread, audience: data.spread.audience } : spread
        )
      );
      setActiveSpreadId(audience === "commons" ? spreadId : null);
      markDimmed(audience === "mesh" ? spreadId : null);
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setUpdatingId(null);
    }
  }

  async function saveLabel(spreadId: string) {
    if (!editLabel.trim() || updatingId) return;
    setUpdatingId(spreadId);
    try {
      const response = await fetch(`/api/spreads/${spreadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: editLabel.trim() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to update label.");
      setItems((prev) =>
        prev.map((spread) =>
          spread.id === spreadId ? { ...spread, label: data.spread.label } : spread
        )
      );
      setEditingId(null);
      setEditLabel("");
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setUpdatingId(null);
    }
  }

  async function deleteSpread(spreadId: string) {
    if (updatingId) return;
    setUpdatingId(spreadId);
    try {
      const response = await fetch(`/api/spreads/${spreadId}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to delete spread.");
      setItems((prev) => prev.filter((spread) => spread.id !== spreadId));
      if (activeSpreadId === spreadId) setActiveSpreadId(null);
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setUpdatingId(null);
    }
  }

  const orderedSpreads = useMemo(() => {
    const mesh = items.filter((spread) => spread.audience === "mesh");
    const commons = items.filter((spread) => spread.audience === "commons");
    return [...mesh, ...commons];
  }, [items]);

  const commonsForCard = useMemo(
    () =>
      orderedSpreads
        .filter((spread) => spread.audience === "commons")
        .slice(0, 4)
        .map((spread) => {
          const parsed = parseSpreadLink(spread.label);
          return {
            icon: parsed.icon,
            display: parsed.display,
          };
        }),
    [orderedSpreads]
  );

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
          <NodeCard
            handle={node.handle}
            mainLink={node.mainLink}
            displayName={node.displayName}
            photoUrl={node.photoUrl}
            videoUrl={node.videoUrl}
            commons={commonsForCard}
          />
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
                      const isBusy =
                        pendingId === spread.id || updatingId === spread.id;
                      const isEditing = editingId === spread.id;

                      return (
                        <div
                          key={spread.id}
                          className="flex flex-wrap items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-3"
                        >
                          {isEditing ? (
                            <div className="flex flex-1 min-w-0 items-center gap-2">
                              <input
                                value={editLabel}
                                onChange={(e) => setEditLabel(e.target.value)}
                                className="min-w-0 flex-1 rounded-full border border-white/12 bg-black/25 px-3 py-2 text-sm text-white outline-none placeholder:text-white/35 focus:border-white/30"
                              />
                              <button
                                type="button"
                                onClick={() => saveLabel(spread.id)}
                                disabled={!editLabel.trim() || isBusy}
                                className="rounded-full border border-white/12 px-3 py-2 text-xs text-white transition hover:border-white/30 disabled:opacity-50"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingId(null);
                                  setEditLabel("");
                                }}
                                className="rounded-full border border-white/12 px-3 py-2 text-xs text-white/70 transition hover:border-white/30"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-1 min-w-0 items-center gap-2 text-sm text-white">
                              <span className="inline-block h-2 w-2 rounded-full bg-current opacity-80" />
                              <span className="truncate">{spread.label}</span>
                            </div>
                          )}

                          {!isEditing ? (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setAudience(spread.id, "mesh")}
                                disabled={isBusy}
                                className={`rounded-full px-3 py-2 text-xs transition ${
                                  spread.audience === "mesh"
                                    ? "bg-black text-white ring-1 ring-white/16"
                                    : "border border-white/12 text-white/80 hover:border-white/30"
                                } ${isBusy ? "opacity-50" : ""}`}
                              >
                                Mesh
                              </button>
                              <button
                                type="button"
                                onClick={() => setAudience(spread.id, "commons")}
                                disabled={isBusy}
                                className={`rounded-full px-3 py-2 text-xs transition ${
                                  spread.audience === "commons"
                                    ? "bg-white text-black shadow-[0_0_18px_rgba(255,255,255,0.35)]"
                                    : "border border-white/12 text-white/80 hover:border-white/30"
                                } ${isBusy ? "opacity-50" : ""}`}
                              >
                                Commons
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingId(spread.id);
                                  setEditLabel(spread.label);
                                }}
                                className="rounded-full border border-white/12 px-3 py-2 text-xs text-white/80 transition hover:border-white/30"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteSpread(spread.id)}
                                disabled={isBusy}
                                className="rounded-full border border-white/12 px-3 py-2 text-xs text-white/70 transition hover:border-white/30 disabled:opacity-50"
                              >
                                Delete
                              </button>
                            </div>
                          ) : null}
                        </div>
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
