import { inferCategoryFromText, isValidCategory } from "../lib/categories";
import db, { ensureSchema } from "../lib/db";

type ProductRow = {
  id: number;
  name: string;
  description: string | null;
  category: string | null;
};

function rowToProduct(row: Record<string, unknown>): ProductRow {
  return {
    id: Number(row.id),
    name: String(row.name),
    description: row.description == null ? null : String(row.description),
    category: row.category == null ? null : String(row.category),
  };
}

async function main() {
  await ensureSchema();
  const force = process.argv.includes("--force");

  const res = await db.execute(
    "SELECT id, name, description, category FROM products ORDER BY id",
  );
  const products = res.rows.map((row) =>
    rowToProduct(row as Record<string, unknown>),
  );

  let updated = 0;
  let skipped = 0;

  for (const product of products) {
    if (!force && product.category && isValidCategory(product.category)) {
      skipped += 1;
      continue;
    }

    const category = inferCategoryFromText(product.name, product.description);
    if (!category) {
      skipped += 1;
      console.log(`#${product.id} ${product.name} -> тег не найден`);
      continue;
    }

    if (product.category === category) {
      skipped += 1;
      continue;
    }

    await db.execute({
      sql: "UPDATE products SET category = ? WHERE id = ?",
      args: [category, product.id],
    });
    updated += 1;
    console.log(`#${product.id} ${product.name} -> ${category}`);
  }

  console.log(`Готово. Обновлено: ${updated}. Пропущено: ${skipped}.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
