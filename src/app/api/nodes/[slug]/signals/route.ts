import { NextRequest, NextResponse } from "next/server";
import { SignalType } from "@prisma/client";
import { getPrisma } from "@/lib/prisma";
import { normalizeEmail } from "@/lib/utils";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const prisma = getPrisma();
    const { slug } = await params;
    const body = await req.json();
    const senderEmail = normalizeEmail(body.senderEmail || "");
    const type = body.type as SignalType;
    const message = String(body.message || "").trim();

    if (!senderEmail || !senderEmail.includes("@")) {
      return NextResponse.json({ error: "Valid senderEmail required." }, { status: 400 });
    }

    if (!type || !Object.values(SignalType).includes(type)) {
      return NextResponse.json({ error: "Valid signal type required." }, { status: 400 });
    }

    if (!message) {
      return NextResponse.json({ error: "Message required." }, { status: 400 });
    }

    const node = await prisma.node.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!node) {
      return NextResponse.json({ error: "Node not found." }, { status: 404 });
    }

    const signal = await prisma.signal.create({
      data: {
        nodeId: node.id,
        senderEmail,
        type,
        subject: String(body.subject || "").trim() || null,
        message,
      },
    });

    return NextResponse.json({ ok: true, signal }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create signal." }, { status: 500 });
  }
}
