import Link from "next/link";
import { commonsSections, featuredNodes, productWords } from "@/lib/content";

export default function CommonsPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-73px)] max-w-6xl flex-col gap-16 px-6 py-12">
      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
          <p className="text-sm uppercase tracking-[0.3em] text-[var(--accent)]">
            {productWords.commons}
          </p>
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-6xl">
            The public layer where nodes open, signals circulate, and discovery stays simple.
          </h1>
          <p className="max-w-xl text-lg leading-8 text-[var(--muted)]">
            Everyone can look first. Owners see more through the Mesh. Others leave
            an email only when they want to act.
          </p>
        </div>
        <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--panel)] p-6">
          <p className="text-sm uppercase tracking-[0.28em] text-[var(--muted)]">
            Entry logic
          </p>
          <ul className="mt-6 space-y-4 text-sm leading-7 text-[var(--muted)]">
            <li>No forced signup at the door.</li>
            <li>Nodes can stay public while deeper actions stay gated by email.</li>
            <li>Owners can maintain a visible space without exposing their whole Vault.</li>
          </ul>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        {commonsSections.map((section) => (
          <article
            key={section.title}
            className="rounded-[1.6rem] border border-[var(--line)] bg-[var(--panel)] p-6"
          >
            <h2 className="text-xl font-medium">{section.title}</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
              {section.description}
            </p>
          </article>
        ))}
      </section>

      <section className="space-y-5">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-[var(--muted)]">
            Sample Nodes
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">
            A first view of Commons and Mesh layers
          </h2>
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          {featuredNodes.map((node) => (
            <article
              key={node.slug}
              className="rounded-[2rem] border border-[var(--line)] bg-[var(--panel)] p-6"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-medium">{node.displayName}</h3>
                  <p className="text-sm text-[var(--muted)]">{node.handle}</p>
                </div>
                <span className="rounded-full bg-[var(--chip)] px-3 py-1 text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
                  {node.isLive ? "Live" : "Quiet"}
                </span>
              </div>
              <p className="mt-5 text-sm leading-7 text-[var(--muted)]">{node.shortBio}</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
                    Commons
                  </p>
                  <ul className="mt-3 space-y-2 text-sm">
                    {node.commonsSpreads.map((spread) => (
                      <li key={spread} className="rounded-full bg-[var(--chip)] px-3 py-2">
                        {spread}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
                    Mesh
                  </p>
                  <ul className="mt-3 space-y-2 text-sm">
                    {node.meshSpreads.map((spread) => (
                      <li
                        key={spread}
                        className="rounded-full border border-[var(--line)] px-3 py-2 text-[var(--muted)]"
                      >
                        {spread}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <Link
                href={`/node/${node.slug}`}
                className="mt-6 inline-flex rounded-full border border-[var(--line)] px-4 py-2 text-sm transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
              >
                Open Node
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
