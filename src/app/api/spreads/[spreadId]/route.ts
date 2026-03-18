import { NextRequest, NextResponse } from "next/server";
import { SpreadAudience } from "@prisma/client";
import { getPrisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ spreadId: string }> }
) {
  try {
    const prisma = getPrisma();
    const { spreadId } = await params;
    const body = await req.json();
    const audience = body.audience as SpreadAudience;

    if (!audience || !Object.values(SpreadAudience).includes(audience)) {
      return NextResponse.json({ error: "Valid audience required." }, { status: 400 });
    }

    const spread = await prisma.spread.update({
      where: { id: spreadId },
      data: { audience },
    });

    return NextResponse.json({ ok: true, spread });
  } catch {
    return NextResponse.json({ error: "Failed to update spread." }, { status: 500 });
  }
}
