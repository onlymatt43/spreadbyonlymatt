import Link from "next/link";
import { notFound } from "next/navigation";
import { SpreadAudience } from "@prisma/client";
import { featuredNodes } from "@/lib/content";
import { getPrisma } from "@/lib/prisma";
import { parseSpreadLink } from "@/lib/utils";
import { NodeCard } from "@/components/node-card";

export default async function NodePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const prisma = getPrisma();
  const dbNode = await prisma.node.findUnique({
    where: { slug },
    include: {
      spreads: {
        where: {
          isPublished: true,
        },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  const mockNode = featuredNodes.find((entry) => entry.slug === slug);

  if (!dbNode && !mockNode) {
    notFound();
  }

  const normalizedNode = dbNode
    ? {
        displayName: dbNode.displayName,
        handle: dbNode.mainUsername
          ? `@${dbNode.mainUsername}`
          : dbNode.mainPlatform || "Owner",
        mainLink: dbNode.mainLink,
        photoUrl: dbNode.photoUrl,
        videoUrl: dbNode.videoUrl,
        commonsSpreads: dbNode.spreads
          .filter((spread) => spread.audience === SpreadAudience.commons)
          .map((spread) => spread.label),
        meshSpreads: dbNode.spreads
          .filter((spread) => spread.audience === SpreadAudience.mesh)
          .map((spread) => spread.label),
      }
    : {
        displayName: mockNode!.displayName,
        handle: mockNode!.handle,
        mainLink: mockNode!.mainLink,
        photoUrl: null,
        videoUrl: null,
        commonsSpreads: mockNode!.commonsSpreads,
        meshSpreads: mockNode!.meshSpreads,
      };

  const commonsSpreadItems = normalizedNode.commonsSpreads.map((spread) => {
    const parsed = parseSpreadLink(spread);

    return {
      raw: spread,
      isLink: parsed.isLink,
      href: parsed.href,
      icon: parsed.icon,
      display: parsed.display,
    };
  });

  return (
    <main className="mx-auto flex min-h-[calc(100vh-73px)] max-w-6xl flex-col gap-6 px-6 py-12">
      <section className="rounded-[2rem] border border-[var(--line)] bg-[var(--panel)] p-8">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <NodeCard
            handle={normalizedNode.handle}
            mainLink={normalizedNode.mainLink}
            displayName={normalizedNode.displayName}
            photoUrl={normalizedNode.photoUrl}
            videoUrl={normalizedNode.videoUrl}
            commons={commonsSpreadItems.slice(0, 4).map((item) => ({
              icon: item.icon,
              display: item.display,
            }))}
          />
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm uppercase tracking-[0.28em] text-[var(--muted)]">
                Commons spreads
              </p>
              <button className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--ink-strong)]">
                Spread It
              </button>
            </div>
            <div className="rounded-[1.2rem] border border-[var(--line)] bg-white p-4">
              <div className="text-sm text-[var(--muted)]">Public spreads</div>
              <div className="mt-4 flex flex-wrap gap-3">
                {commonsSpreadItems.length === 0 ? (
                  <div className="rounded-full border border-[var(--line)] px-3 py-2 text-sm text-[var(--muted)]">
                    None yet
                  </div>
                ) : (
                  commonsSpreadItems.map((item) => (
                    <a
                      key={item.raw}
                      href={item.href || undefined}
                      target={item.href ? "_blank" : undefined}
                      rel={item.href ? "noreferrer" : undefined}
                      className="flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--ink)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--ink)] text-[10px] font-semibold text-[var(--canvas)]">
                        {item.icon}
                      </span>
                      <span className="truncate max-w-[160px]">{item.display}</span>
                    </a>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="flex flex-wrap gap-3">
        <Link
          href="/enter"
          className="rounded-full border border-[var(--line)] px-5 py-3 text-sm transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
        >
          Send email to continue
        </Link>
      </section>
    </main>
  );
}
