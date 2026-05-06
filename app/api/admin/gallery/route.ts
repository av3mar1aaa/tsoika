import { NextResponse } from "next/server";
import { createGalleryPhoto } from "@/lib/gallery";
import { uploadImage } from "@/lib/upload";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(request: Request) {
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Файл не загружен" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json(
      { error: "Принимаются только изображения" },
      { status: 400 },
    );
  }

  try {
    const url = await uploadImage(file);
    const photo = await createGalleryPhoto(url);
    return NextResponse.json({ photo });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Ошибка загрузки";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
