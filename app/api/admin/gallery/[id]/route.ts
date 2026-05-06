import { NextResponse } from "next/server";
import { deleteGalleryPhoto } from "@/lib/gallery";
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
  const removed = await deleteGalleryPhoto(id);
  if (!removed) {
    return NextResponse.json({ error: "Не найдено" }, { status: 404 });
  }
  await deleteUpload(removed.url);
  return NextResponse.json({ ok: true });
}
