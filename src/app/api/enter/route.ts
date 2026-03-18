import { NextRequest, NextResponse } from "next/server";
import { EmailIntent } from "@prisma/client";
import { getPrisma } from "@/lib/prisma";
import { createPlainToken, hashToken } from "@/lib/tokens";
import { normalizeEmail } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const prisma = getPrisma();
    const body = await req.json();
    const email = normalizeEmail(body.email || "");
    const intent = body.intent as EmailIntent;

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email required." }, { status: 400 });
    }

    if (!intent || !["owner", "action"].includes(intent)) {
      return NextResponse.json({ error: "Valid intent required." }, { status: 400 });
    }

    const token = createPlainToken();
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30);

    await prisma.emailSession.create({
      data: {
        email,
        intent,
        tokenHash,
        expiresAt,
      },
    });

    return NextResponse.json({
      ok: true,
      email,
      intent,
      token,
      expiresAt,
    });
  } catch {
    return NextResponse.json({ error: "Failed to create email session." }, { status: 500 });
  }
}
