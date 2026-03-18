"use client";

import { useRef, useState } from "react";

export type CommonsSpreadItem = {
  raw: string;
  isLink: boolean;
  href: string | null;
  icon: string;
  display: string;
};

type Props = {
  items: CommonsSpreadItem[];
};

export function CommonsSpreads({ items }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [softClosing, setSoftClosing] = useState<string | null>(null);
  const collapseTimerRef = useRef<number | null>(null);

  function isDownloadable(href: string | null) {
    if (!href) return false;
    const lower = href.toLowerCase();
    return [
      ".pdf",
      ".png",
      ".jpg",
      ".jpeg",
      ".gif",
      ".webp",
      ".mp4",
      ".mov",
      ".zip",
      ".doc",
      ".docx",
      ".ppt",
      ".pptx",
      ".xls",
      ".xlsx",
      ".txt",
      ".csv",
      ".heic",
    ].some((ext) => lower.includes(ext));
  }

  function clearCollapseTimer() {
    if (collapseTimerRef.current) {
      window.clearTimeout(collapseTimerRef.current);
      collapseTimerRef.current = null;
    }
  }

  function openSpread(value: string) {
    clearCollapseTimer();
    setSoftClosing(null);
    setExpanded(value);
  }

  function closeSpread(value: string) {
    clearCollapseTimer();
    setSoftClosing(value);
    collapseTimerRef.current = window.setTimeout(() => {
      setExpanded((current) => (current === value ? null : current));
      setSoftClosing((current) => (current === value ? null : current));
      collapseTimerRef.current = null;
    }, 420);
  }

  async function copyValue(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(value);
      window.setTimeout(() => setCopied(null), 1600);
    } catch {
      setCopied(null);
    }
  }

  return (
    <div className="mt-5 flex flex-wrap gap-4">
      {items.map((item) => {
        const isExpanded = expanded === item.raw;
        const isSoftClosing = softClosing === item.raw;
        const isOpen = isExpanded || isSoftClosing;

        return (
          <div
            key={item.raw}
            onMouseEnter={() => openSpread(item.raw)}
            onMouseLeave={() => closeSpread(item.raw)}
            className={`group relative transition-all duration-700 ease-out ${
              isOpen ? "z-10" : "z-0"
            }`}
          >
            <button
              type="button"
              onClick={() =>
                isExpanded || isSoftClosing ? closeSpread(item.raw) : openSpread(item.raw)
              }
              className={`flex items-center gap-3 overflow-hidden rounded-full border px-4 py-3 text-sm text-black transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                isOpen
                  ? "min-w-[260px] border-white/90 bg-white pr-3 shadow-[0_18px_48px_rgba(0,0,0,0.12),0_0_36px_rgba(255,245,186,0.55)]"
                  : "h-14 w-14 justify-center border-white/70 bg-white/92 px-0 shadow-[0_10px_24px_rgba(0,0,0,0.06)]"
              }`}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold transition-all duration-700 ${
                  isOpen
                    ? "bg-black text-white shadow-[0_0_22px_rgba(255,234,149,0.45)]"
                    : "bg-black text-white shadow-[0_0_12px_rgba(255,255,255,0.18)]"
                }`}
              >
                {item.icon}
              </span>
              <span
                className={`truncate text-left transition-all duration-500 ${
                  isOpen
                    ? "max-w-[170px] translate-x-0 opacity-100"
                    : "max-w-0 -translate-x-2 opacity-0"
                }`}
              >
                {item.display}
              </span>
            </button>

            <div
              className={`mt-2 flex flex-wrap gap-2 pl-1 transition-all duration-500 ${
                isOpen
                  ? "pointer-events-auto translate-y-0 opacity-100"
                  : "pointer-events-none -translate-y-1 opacity-0"
              }`}
            >
              {item.href ? (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-black px-3 py-2 text-xs font-medium text-white transition-all duration-300 hover:bg-[var(--accent)] hover:text-black"
                >
                  Open
                </a>
              ) : null}
              {isDownloadable(item.href) ? (
                <a
                  href={item.href!}
                  download
                  className="rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-medium text-black transition-all duration-300 hover:border-black/25"
                >
                  Download
                </a>
              ) : null}
              <button
                type="button"
                onClick={() => copyValue(item.href || item.raw)}
                className="rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-medium text-black transition-all duration-300 hover:border-black/25"
              >
                {copied === item.raw ? "Copied" : "Copy"}
              </button>
              <button
                type="button"
                className="rounded-full border border-[var(--accent)] bg-[var(--accent)]/25 px-3 py-2 text-xs font-medium text-black transition-all duration-300 hover:bg-[var(--accent)]"
              >
                Spread It
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
