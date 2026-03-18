import { SpreadAudience } from "@prisma/client";
import { notFound } from "next/navigation";
import { featuredNodes } from "@/lib/content";
import { getPrisma } from "@/lib/prisma";
import { OwnerCabin } from "@/components/owner-cabin";

export default async function OwnerNodePage({
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
        where: { isPublished: true },
        orderBy: { sortOrder: "asc" },
      },
      vaultItems: {
        include: {
          spreads: {
            where: { isPublished: true },
            orderBy: { createdAt: "asc" },
            select: {
              id: true,
              audience: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  const mockNode = featuredNodes.find((entry) => entry.slug === slug);

  if (!dbNode && !mockNode) {
    notFound();
  }

  const node = dbNode
    ? {
        handle: dbNode.mainUsername
          ? `@${dbNode.mainUsername}`
          : dbNode.mainPlatform || "Owner",
        mainLink: dbNode.mainLink,
        displayName: dbNode.displayName,
        photoUrl: dbNode.photoUrl,
        videoUrl: dbNode.videoUrl,
      }
    : {
        handle: mockNode!.handle,
        mainLink: mockNode!.mainLink,
        displayName: mockNode!.displayName,
        photoUrl: null,
        videoUrl: null,
      };

  const spreads = dbNode
    ? dbNode.spreads.map((spread) => ({
        id: spread.id,
        label: spread.label,
        audience: spread.audience as "commons" | "mesh",
      }))
    : [
        ...mockNode!.meshSpreads.map((label, index) => ({
          id: `mesh-${index}`,
          label,
          audience: SpreadAudience.mesh as "mesh",
        })),
        ...mockNode!.commonsSpreads.map((label, index) => ({
          id: `commons-${index}`,
          label,
          audience: SpreadAudience.commons as "commons",
        })),
      ];

  const vaultItems = dbNode
    ? dbNode.vaultItems.map((item) => ({
        id: item.id,
        title: item.title,
        type: item.type,
        externalUrl: item.externalUrl,
        fileUrl: item.fileUrl,
        linkedSpreadId: item.spreads[0]?.id ?? null,
      }))
    : [];

  return <OwnerCabin nodeId={dbNode?.id ?? null} node={node} spreads={spreads} vaultItems={vaultItems} />;
}
