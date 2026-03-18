import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File required." }, { status: 400 });
    }

    const safeName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
    const blob = await put(safeName, file, {
      access: "public",
    });

    return NextResponse.json({
      ok: true,
      url: blob.url,
      pathname: blob.pathname,
      contentType: file.type || null,
      fileName: file.name,
    });
  } catch {
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}
