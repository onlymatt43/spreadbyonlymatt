import { NextRequest, NextResponse } from "next/server";
import { SpreadAudience, SpreadKind } from "@prisma/client";
import { getPrisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ nodeId: string }> }
) {
  try {
    const prisma = getPrisma();
    const { nodeId } = await params;
    const body = await req.json();
    const label = String(body.label || "").trim();
    const kind = body.kind as SpreadKind;
    const audience = body.audience as SpreadAudience;

    if (!label || !kind || !audience) {
      return NextResponse.json(
        { error: "Label, kind, and audience are required." },
        { status: 400 }
      );
    }

    if (!Object.values(SpreadKind).includes(kind)) {
      return NextResponse.json({ error: "Invalid spread kind." }, { status: 400 });
    }

    if (!Object.values(SpreadAudience).includes(audience)) {
      return NextResponse.json({ error: "Invalid spread audience." }, { status: 400 });
    }

    const spread = await prisma.spread.create({
      data: {
        nodeId,
        vaultItemId: String(body.vaultItemId || "").trim() || null,
        label,
        kind,
        audience,
        contentText: String(body.contentText || "").trim() || null,
        externalUrl: String(body.externalUrl || "").trim() || null,
        fileUrl: String(body.fileUrl || "").trim() || null,
        sortOrder: Number.isFinite(body.sortOrder) ? Number(body.sortOrder) : 0,
        isPublished: body.isPublished !== false,
      },
    });

    return NextResponse.json({ ok: true, spread }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create spread." }, { status: 500 });
  }
}
