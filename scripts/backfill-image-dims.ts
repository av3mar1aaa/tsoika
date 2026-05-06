import sharp from "sharp";
import db, { ensureSchema } from "../lib/db";

async function main() {
  await ensureSchema();
  const res = await db.execute(
    "SELECT id, image_path FROM products WHERE image_width IS NULL OR image_height IS NULL",
  );

  if (res.rows.length === 0) {
    console.log("Все продукты уже имеют размеры — нечего делать.");
    return;
  }

  console.log(`Найдено ${res.rows.length} продуктов без размеров.`);

  for (const row of res.rows) {
    const r = row as Record<string, unknown>;
    const id = Number(r.id);
    const url = String(r.image_path);
    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.warn(`#${id} ${url} → HTTP ${response.status}, пропускаю`);
        continue;
      }
      const buffer = Buffer.from(await response.arrayBuffer());
      const meta = await sharp(buffer).metadata();
      if (!meta.width || !meta.height) {
        console.warn(`#${id} ${url} → нет размеров в метаданных`);
        continue;
      }
      await db.execute({
        sql: "UPDATE products SET image_width = ?, image_height = ? WHERE id = ?",
        args: [meta.width, meta.height, id],
      });
      console.log(`#${id} ${meta.width}×${meta.height}`);
    } catch (e) {
      console.warn(`#${id} ошибка:`, e instanceof Error ? e.message : e);
    }
  }

  console.log("Готово.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
