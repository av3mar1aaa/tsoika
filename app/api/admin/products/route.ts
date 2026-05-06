import { NextResponse } from "next/server";
import { createProduct, setProductOrderButton } from "@/lib/products";
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
    const uploaded = await uploadImage(image);
    const product = await createProduct({
      name: name.trim(),
      description:
        typeof description === "string" && description.trim()
          ? description.trim()
          : null,
      image_path: uploaded.url,
      image_width: uploaded.width,
      image_height: uploaded.height,
    });
    const showOrderRaw = form.get("show_order_button");
    if (showOrderRaw === "1") {
      await setProductOrderButton(product.id, true);
    }
    return NextResponse.json({ product });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Ошибка загрузки";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
