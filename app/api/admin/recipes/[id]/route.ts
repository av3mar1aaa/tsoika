import { NextResponse } from "next/server";
import { deleteRecipe, getRecipe, updateRecipe } from "@/lib/recipes";

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
  if (!(await getRecipe(id)))
    return NextResponse.json({ error: "Не найдено" }, { status: 404 });

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

  await updateRecipe(id, {
    title: title.trim(),
    ingredients: ingredients.trim(),
    instructions: instructions.trim(),
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: rawId } = await params;
  const id = parseId(rawId);
  if (!id) return NextResponse.json({ error: "Bad id" }, { status: 400 });

  if (!(await getRecipe(id)))
    return NextResponse.json({ error: "Не найдено" }, { status: 404 });

  await deleteRecipe(id);
  return NextResponse.json({ ok: true });
}
