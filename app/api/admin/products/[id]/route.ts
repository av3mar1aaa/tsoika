import { NextResponse } from "next/server";
import {
  deleteProduct,
  getProduct,
  setProductCategory,
  setProductOrderButton,
  updateProduct,
} from "@/lib/products";
import { isValidCategory } from "@/lib/categories";
import { listMediaByProduct } from "@/lib/media";
import { deleteUpload, uploadImage } from "@/lib/upload";

function parseId(raw: string): number | null {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: rawId } = await params;
  const id = parseId(rawId);
  if (!id) return NextResponse.json({ error: "Bad id" }, { status: 400 });

  const existing = await getProduct(id);
  if (!existing)
    return NextResponse.json({ error: "Не найдено" }, { status: 404 });

  const form = await request.formData();
  const name = form.get("name");
  const description = form.get("description");
  const image = form.get("image");

  if (typeof name !== "string" || !name.trim()) {
    return NextResponse.json(
      { error: "Название обязательно" },
      { status: 400 },
    );
  }

  let newImage: { url: string; width: number; height: number } | undefined;
  if (image instanceof File && image.size > 0) {
    try {
      newImage = await uploadImage(image);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Ошибка загрузки";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  await updateProduct(id, {
    name: name.trim(),
    description:
      typeof description === "string" && description.trim()
        ? description.trim()
        : null,
    image_path: newImage?.url,
    image_width: newImage?.width,
    image_height: newImage?.height,
  });

  const showOrderRaw = form.get("show_order_button");
  if (typeof showOrderRaw === "string") {
    await setProductOrderButton(id, showOrderRaw === "1");
  }

  const categoryRaw = form.get("category");
  if (typeof categoryRaw === "string") {
    const trimmed = categoryRaw.trim();
    await setProductCategory(
      id,
      trimmed === "" || !isValidCategory(trimmed) ? null : trimmed,
    );
  }

  if (newImage && existing.image_path !== newImage.url) {
    await deleteUpload(existing.image_path);
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: rawId } = await params;
  const id = parseId(rawId);
  if (!id) return NextResponse.json({ error: "Bad id" }, { status: 400 });

  const removed = await getProduct(id);
  if (!removed)
    return NextResponse.json({ error: "Не найдено" }, { status: 404 });

  const media = await listMediaByProduct(id);
  await deleteProduct(id);

  await deleteUpload(removed.image_path);
  for (const m of media) {
    await deleteUpload(m.url);
  }

  return NextResponse.json({ ok: true });
}
