import { NextResponse } from "next/server";
import { createProduct } from "@/lib/products";
import { uploadImage } from "@/lib/upload";

export async function POST(request: Request) {
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
  if (!(image instanceof File) || image.size === 0) {
    return NextResponse.json(
      { error: "Загрузите обложку" },
      { status: 400 },
    );
  }

  try {
    const imageUrl = await uploadImage(image);
    const product = await createProduct({
      name: name.trim(),
      description:
        typeof description === "string" && description.trim()
          ? description.trim()
          : null,
      image_path: imageUrl,
    });
    return NextResponse.json({ product });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Ошибка загрузки";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
