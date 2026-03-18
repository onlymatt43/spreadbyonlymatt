import { NextRequest, NextResponse } from "next/server";
import { SpreadAudience } from "@prisma/client";
import { getPrisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const prisma = getPrisma();
    const { slug } = await params;

    const node = await prisma.node.findUnique({
      where: { slug },
      include: {
        spreads: {
          where: {
            isPublished: true,
            audience: SpreadAudience.commons,
          },
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!node) {
      return NextResponse.json({ error: "Node not found." }, { status: 404 });
    }

    return NextResponse.json({ node });
  } catch {
    return NextResponse.json({ error: "Failed to load node." }, { status: 500 });
  }
}
