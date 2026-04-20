import { NextResponse } from "next/server";
import { getProduct } from "@/lib/products";
import { createMedia } from "@/lib/media";
import { uploadImage, uploadVideo } from "@/lib/upload";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: rawId } = await params;
  const productId = Number(rawId);
  if (!Number.isInteger(productId) || productId <= 0) {
    return NextResponse.json({ error: "Bad id" }, { status: 400 });
  }
  if (!(await getProduct(productId))) {
    return NextResponse.json({ error: "Продукт не найден" }, { status: 404 });
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Файл не загружен" }, { status: 400 });
  }

  try {
    let kind: "image" | "video";
    let url: string;
    if (file.type.startsWith("image/")) {
      kind = "image";
      url = await uploadImage(file);
    } else if (file.type.startsWith("video/")) {
      kind = "video";
      url = await uploadVideo(file);
    } else {
      return NextResponse.json(
        { error: "Поддерживаются только изображения и видео" },
        { status: 400 },
      );
    }

    const media = await createMedia({ product_id: productId, kind, url });
    return NextResponse.json({ media });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Ошибка загрузки";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
