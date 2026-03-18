import { NextRequest, NextResponse } from "next/server";
import { VaultItemType } from "@prisma/client";
import { getPrisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ nodeId: string }> }
) {
  try {
    const prisma = getPrisma();
    const { nodeId } = await params;

    const items = await prisma.vaultItem.findMany({
      where: { nodeId },
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
    });

    return NextResponse.json({ ok: true, items });
  } catch {
    return NextResponse.json({ error: "Failed to load vault." }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ nodeId: string }> }
) {
  try {
    const prisma = getPrisma();
    const { nodeId } = await params;
    const body = await req.json();
    const type = body.type as VaultItemType;
    const title = String(body.title || "").trim();

    if (!title || !type || !Object.values(VaultItemType).includes(type)) {
      return NextResponse.json({ error: "Valid type and title are required." }, { status: 400 });
    }

    const item = await prisma.vaultItem.create({
      data: {
        nodeId,
        type,
        title,
        contentText: String(body.contentText || "").trim() || null,
        externalUrl: String(body.externalUrl || "").trim() || null,
        fileUrl: String(body.fileUrl || "").trim() || null,
        metaJson: body.metaJson ? JSON.stringify(body.metaJson) : null,
      },
    });

    return NextResponse.json({ ok: true, item }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create vault item." }, { status: 500 });
  }
}
