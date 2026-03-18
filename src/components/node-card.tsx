type NodeCardProps = {
  handle: string;
  mainLink: string;
  displayName: string;
  photoUrl: string | null;
  videoUrl: string | null;
  commons?: { icon: string; display: string }[];
};

export function NodeCard({
  handle,
  mainLink,
  displayName,
  photoUrl,
  videoUrl,
  commons = [],
}: NodeCardProps) {
  return (
    <div className="relative rounded-[2.2rem] border border-[var(--line)] bg-[var(--panel)] p-8 shadow-[0_20px_80px_rgba(0,0,0,0.08)]">
      <div className="relative h-56 overflow-hidden rounded-[1.6rem] bg-[linear-gradient(135deg,#fff1ae,transparent_55%),linear-gradient(180deg,#161616,#393939)]">
        {videoUrl ? (
          <video
            key={videoUrl}
            src={videoUrl}
            className="h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
          />
        ) : photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoUrl} alt={displayName} className="h-full w-full object-cover" />
        ) : null}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,241,174,0.45),transparent_45%),linear-gradient(180deg,transparent,rgba(0,0,0,0.18))]" />
      </div>
      <div className="relative z-10 -mt-10 ml-4 mb-4">
        <div className="relative rounded-[1.4rem] border border-black/10 bg-white p-2 shadow-[0_14px_40px_rgba(0,0,0,0.14)]">
          <div className="h-22 w-22 overflow-hidden rounded-[1rem] bg-[#d9d1c3] sm:h-24 sm:w-24">
            {photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoUrl} alt={handle} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xl font-semibold text-black/55">
                {displayName.slice(0, 1)}
              </div>
            )}
          </div>
          <div className="absolute bottom-2 left-2 rounded-full bg-black/78 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-white/78 backdrop-blur-sm">
            Node
          </div>
        </div>
      </div>
      <a
        href={mainLink}
        target="_blank"
        rel="noreferrer"
        className="mt-2 inline-flex rounded-full bg-[var(--ink)] px-5 py-3 text-sm font-medium text-[var(--canvas)] transition hover:bg-[var(--accent)] hover:text-[var(--ink-strong)]"
      >
        {handle}
      </a>

      {commons.length > 0 ? (
        <div className="mt-5 flex flex-wrap gap-3">
          {commons.map((item, index) => (
            <div
              key={`${item.display}-${index}`}
              className="flex items-center gap-2 rounded-full border border-[var(--line)] bg-white px-3 py-2 text-sm text-black shadow-[0_10px_24px_rgba(0,0,0,0.06)]"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black text-[10px] font-semibold text-white">
                {item.icon}
              </span>
              <span className="truncate max-w-[140px]">{item.display}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
