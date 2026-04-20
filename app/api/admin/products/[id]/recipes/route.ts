import { NextResponse } from "next/server";
import { getProduct } from "@/lib/products";
import { createRecipe } from "@/lib/recipes";

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

  let body: { title?: string; ingredients?: string; instructions?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Bad JSON" }, { status: 400 });
  }

  const { title, ingredients, instructions } = body;
  if (
    typeof title !== "string" ||
    !title.trim() ||
    typeof ingredients !== "string" ||
    !ingredients.trim() ||
    typeof instructions !== "string" ||
    !instructions.trim()
  ) {
    return NextResponse.json(
      { error: "Заполните все поля рецепта" },
      { status: 400 },
    );
  }

  const recipe = await createRecipe({
    product_id: productId,
    title: title.trim(),
    ingredients: ingredients.trim(),
    instructions: instructions.trim(),
  });

  return NextResponse.json({ recipe });
}
