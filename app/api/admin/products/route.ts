import { NextResponse } from "next/server";
import {
  createProduct,
  setProductCategory,
  setProductOrderButton,
} from "@/lib/products";
import { uploadImage } from "@/lib/upload";
import { inferCategoryFromText, isValidCategory } from "@/lib/categories";
import { revalidateProducts } from "@/lib/cache";

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
    const normalizedName = name.trim();
    const normalizedDescription =
      typeof description === "string" && description.trim()
        ? description.trim()
        : null;
    const categoryRaw = form.get("category");
    const selectedCategory =
      typeof categoryRaw === "string" && isValidCategory(categoryRaw.trim())
        ? categoryRaw.trim()
        : null;
    const category =
      selectedCategory ??
      inferCategoryFromText(normalizedName, normalizedDescription);
    const imageFit = parseImageFit(form);

    const uploaded = await uploadImage(image);
    const product = await createProduct({
      name: normalizedName,
      description: normalizedDescription,
      image_path: uploaded.url,
      image_width: uploaded.width,
      image_height: uploaded.height,
      category,
      ...imageFit,
    });
    const showOrderRaw = form.get("show_order_button");
    if (showOrderRaw === "1") {
      await setProductOrderButton(product.id, true);
    }
    if (category) {
      await setProductCategory(product.id, category);
    }
    revalidateProducts(product.id);
    return NextResponse.json({ product });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Ошибка загрузки";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function parseImageFit(form: FormData): {
  image_zoom: number;
  image_focus_x: number;
  image_focus_y: number;
} {
  return {
    image_zoom: clampNumber(form.get("image_zoom"), 1, 2, 1),
    image_focus_x: clampNumber(form.get("image_focus_x"), 0, 100, 50),
    image_focus_y: clampNumber(form.get("image_focus_y"), 0, 100, 50),
  };
}

function clampNumber(
  value: FormDataEntryValue | null,
  min: number,
  max: number,
  fallback: number,
): number {
  const n = typeof value === "string" ? Number(value) : Number.NaN;
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}
