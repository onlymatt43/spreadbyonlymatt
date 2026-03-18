import Link from "next/link";
import { notFound } from "next/navigation";
import { SpreadAudience } from "@prisma/client";
import { featuredNodes } from "@/lib/content";
import { getPrisma } from "@/lib/prisma";
import { parseSpreadLink } from "@/lib/utils";
import { CommonsSpreads } from "@/components/commons-spreads";
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
    <main className="mx-auto flex min-h-[calc(100vh-73px)] max-w-6xl flex-col gap-10 px-6 py-12">
      <section className="space-y-6">
        <NodeCard
          handle={normalizedNode.handle}
          mainLink={normalizedNode.mainLink}
          displayName={normalizedNode.displayName}
          photoUrl={normalizedNode.photoUrl}
          videoUrl={normalizedNode.videoUrl}
        />
        <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--panel)] p-8">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm uppercase tracking-[0.28em] text-[var(--muted)]">
              Commons spreads
            </p>
            <button className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--ink-strong)]">
              Spread It
            </button>
          </div>
          <CommonsSpreads items={commonsSpreadItems} />
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
