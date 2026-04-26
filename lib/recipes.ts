import db, { ensureSchema } from "./db";

export type Recipe = {
  id: number;
  product_id: number;
  title: string;
  ingredients: string;
  instructions: string;
  created_at: number;
};

function rowToRecipe(row: Record<string, unknown>): Recipe {
  return {
    id: Number(row.id),
    product_id: Number(row.product_id),
    title: String(row.title),
    ingredients: String(row.ingredients),
    instructions: String(row.instructions),
    created_at: Number(row.created_at),
  };
}

export async function listRecipesByProduct(
  productId: number,
): Promise<Recipe[]> {
  await ensureSchema();
  const res = await db.execute({
    sql: "SELECT * FROM recipes WHERE product_id = ? ORDER BY created_at ASC",
    args: [productId],
  });
  return res.rows.map((r) => rowToRecipe(r as Record<string, unknown>));
}

export async function getRecipe(id: number): Promise<Recipe | null> {
  await ensureSchema();
  const res = await db.execute({
    sql: "SELECT * FROM recipes WHERE id = ?",
    args: [id],
  });
  if (res.rows.length === 0) return null;
  return rowToRecipe(res.rows[0] as Record<string, unknown>);
}

export async function createRecipe(input: {
  product_id: number;
  title: string;
  ingredients: string;
  instructions: string;
}): Promise<Recipe> {
  await ensureSchema();
  const now = Date.now();
  const res = await db.execute({
    sql: "INSERT INTO recipes (product_id, title, ingredients, instructions, created_at) VALUES (?, ?, ?, ?, ?) RETURNING *",
    args: [
      input.product_id,
      input.title,
      input.ingredients,
      input.instructions,
      now,
    ],
  });
  return rowToRecipe(res.rows[0] as Record<string, unknown>);
}

export async function updateRecipe(
  id: number,
  input: { title: string; ingredients: string; instructions: string },
): Promise<void> {
  await ensureSchema();
  await db.execute({
    sql: "UPDATE recipes SET title = ?, ingredients = ?, instructions = ? WHERE id = ?",
    args: [input.title, input.ingredients, input.instructions, id],
  });
}

export async function deleteRecipe(id: number): Promise<void> {
  await ensureSchema();
  await db.execute({
    sql: "DELETE FROM recipes WHERE id = ?",
    args: [id],
  });
}

export async function appendToFirstRecipeOfProduct(
  productId: number,
  text: string,
): Promise<Recipe> {
  await ensureSchema();
  const res = await db.execute({
    sql: "SELECT * FROM recipes WHERE product_id = ? ORDER BY created_at ASC LIMIT 1",
    args: [productId],
  });
  if (res.rows.length === 0) {
    return createRecipe({
      product_id: productId,
      title: "Рецепт",
      ingredients: "",
      instructions: text,
    });
  }
  const recipe = rowToRecipe(res.rows[0] as Record<string, unknown>);
  const merged = recipe.instructions
    ? `${recipe.instructions}\n${text}`
    : text;
  await db.execute({
    sql: "UPDATE recipes SET instructions = ? WHERE id = ?",
    args: [merged, recipe.id],
  });
  return { ...recipe, instructions: merged };
}
