import Link from "next/link";
import { featuredNodes, productWords } from "@/lib/content";

export default function Home() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <section className="grid gap-8 pb-16 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-[var(--accent)]">
            {productWords.brand}
          </p>
          <h1 className="mt-5 max-w-4xl text-5xl font-semibold tracking-tight sm:text-7xl">
            Build your Node. Publish your Spreads. Let the Mesh move around it.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)]">
            SPREAD starts open. Owners keep a private Vault, publish only what they
            want inside a Node, and let others discover, suggest, and signal through
            the Commons.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/commons"
              className="rounded-full bg-[var(--ink)] px-5 py-3 text-sm font-medium text-[var(--canvas)] transition hover:bg-[var(--accent)] hover:text-[var(--ink-strong)]"
            >
              Enter the Commons
            </Link>
            <Link
              href="/enter"
              className="rounded-full border border-[var(--line)] px-5 py-3 text-sm font-medium transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              Create your Node
            </Link>
          </div>
        </div>

        <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--panel)] p-6">
          <p className="text-sm uppercase tracking-[0.28em] text-[var(--muted)]">
            Product grammar
          </p>
          <dl className="mt-6 space-y-4 text-sm">
            <div className="flex justify-between gap-6 border-b border-[var(--line)] pb-4">
              <dt>Node</dt>
              <dd className="text-[var(--muted)]">Owner space</dd>
            </div>
            <div className="flex justify-between gap-6 border-b border-[var(--line)] pb-4">
              <dt>Vault</dt>
              <dd className="text-[var(--muted)]">Private storage</dd>
            </div>
            <div className="flex justify-between gap-6 border-b border-[var(--line)] pb-4">
              <dt>Spreads</dt>
              <dd className="text-[var(--muted)]">Published units</dd>
            </div>
            <div className="flex justify-between gap-6 border-b border-[var(--line)] pb-4">
              <dt>Spread Me</dt>
              <dd className="text-[var(--muted)]">Owner action</dd>
            </div>
            <div className="flex justify-between gap-6">
              <dt>Spread It</dt>
              <dd className="text-[var(--muted)]">Public signal</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="grid gap-5 py-12 lg:grid-cols-3">
        <article className="rounded-[1.8rem] border border-[var(--line)] bg-[var(--panel)] p-6">
          <p className="text-sm uppercase tracking-[0.28em] text-[var(--muted)]">Commons</p>
          <h2 className="mt-4 text-2xl font-medium">Open first</h2>
          <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
            Anyone can enter before deciding to act or send an email.
          </p>
        </article>
        <article className="rounded-[1.8rem] border border-[var(--line)] bg-[var(--panel)] p-6">
          <p className="text-sm uppercase tracking-[0.28em] text-[var(--muted)]">Mesh</p>
          <h2 className="mt-4 text-2xl font-medium">Owner layer</h2>
          <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
            Owners see the Commons layer plus an additional network layer inside Nodes.
          </p>
        </article>
        <article className="rounded-[1.8rem] border border-[var(--line)] bg-[var(--panel)] p-6">
          <p className="text-sm uppercase tracking-[0.28em] text-[var(--muted)]">Vault</p>
          <h2 className="mt-4 text-2xl font-medium">Prepare in private</h2>
          <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
            Proofs, documents, links, and authorizations stay private until they become a Spread.
          </p>
        </article>
      </section>

      <section className="py-12">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-[var(--muted)]">
            Starting points
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">Sample Nodes</h2>
        </div>
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          {featuredNodes.map((node) => (
            <Link
              key={node.slug}
              href={`/node/${node.slug}`}
              className="rounded-[2rem] border border-[var(--line)] bg-[var(--panel)] p-6 transition hover:-translate-y-0.5 hover:border-[var(--accent)]"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-medium">{node.displayName}</h3>
                  <p className="text-sm text-[var(--muted)]">{node.handle}</p>
                </div>
                <span className="rounded-full bg-[var(--chip)] px-3 py-1 text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
                  {node.isLive ? "Node live" : "Node quiet"}
                </span>
              </div>
              <p className="mt-5 text-sm leading-7 text-[var(--muted)]">{node.shortBio}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
