import { NextResponse } from "next/server";
import { deleteMedia, getMedia } from "@/lib/media";
import { deleteUpload } from "@/lib/upload";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: rawId } = await params;
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "Bad id" }, { status: 400 });
  }
  const existing = await getMedia(id);
  if (!existing) {
    return NextResponse.json({ error: "Не найдено" }, { status: 404 });
  }
  await deleteMedia(id);
  await deleteUpload(existing.url);
  return NextResponse.json({ ok: true });
}
