import { NextRequest, NextResponse } from "next/server";
import { OwnerStatus } from "@prisma/client";
import { getPrisma } from "@/lib/prisma";
import { normalizeEmail, parseMainLink, slugify } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const prisma = getPrisma();
    const body = await req.json();
    const email = normalizeEmail(body.email || "");
    const displayName = String(body.displayName || "").trim();
    const mainLink = String(body.mainLink || "").trim();
    const shortBio = String(body.shortBio || "").trim();
    const requestedSlug = String(body.slug || "").trim();
    const parsedLink = parseMainLink(mainLink);

    if (!email || !displayName || !mainLink) {
      return NextResponse.json(
        { error: "Email, displayName, and mainLink are required." },
        { status: 400 }
      );
    }

    const owner = await prisma.owner.upsert({
      where: { email },
      update: { status: OwnerStatus.active },
      create: {
        email,
        status: OwnerStatus.active,
      },
    });

    const baseSlug = slugify(requestedSlug || displayName);

    if (!baseSlug) {
      return NextResponse.json({ error: "Unable to generate slug." }, { status: 400 });
    }

    const existingForOwner = await prisma.node.findUnique({
      where: { ownerId: owner.id },
    });

    if (existingForOwner) {
      return NextResponse.json(
        { error: "Owner already has a node.", node: existingForOwner },
        { status: 409 }
      );
    }

    let slug = baseSlug;
    let suffix = 1;

    while (await prisma.node.findUnique({ where: { slug } })) {
      suffix += 1;
      slug = `${baseSlug}-${suffix}`;
    }

    const node = await prisma.node.create({
      data: {
        ownerId: owner.id,
        slug,
        displayName,
        mainLink,
        mainUsername: parsedLink.username,
        mainPlatform: parsedLink.platform,
        shortBio: shortBio || null,
        photoUrl: String(body.photoUrl || "").trim() || null,
        videoUrl: String(body.videoUrl || "").trim() || null,
      },
    });

    return NextResponse.json({ ok: true, node }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create node." }, { status: 500 });
  }
}
