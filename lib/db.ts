import { createClient } from "@libsql/client";
import fs from "node:fs";
import path from "node:path";

const url = process.env.TURSO_DATABASE_URL ?? `file:${defaultLocalPath()}`;
const authToken = process.env.TURSO_AUTH_TOKEN;

function defaultLocalPath(): string {
  const dir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, "app.db");
}

const db = createClient({ url, authToken });

let schemaReady: Promise<void> | null = null;

async function addColumnIfMissing(
  table: string,
  column: string,
  alterSql: string,
): Promise<void> {
  const info = await db.execute({
    sql: `PRAGMA table_info(${table})`,
    args: [],
  });
  const exists = info.rows.some(
    (r) => String((r as Record<string, unknown>).name) === column,
  );
  if (!exists) {
    await db.execute(alterSql);
  }
}

async function migrate(): Promise<void> {
  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      image_path TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS recipes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      ingredients TEXT NOT NULL,
      instructions TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_recipes_product ON recipes(product_id);

    CREATE TABLE IF NOT EXISTS product_media (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      kind TEXT NOT NULL CHECK (kind IN ('image','video')),
      url TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_media_product ON product_media(product_id, sort_order);
  `);

  await addColumnIfMissing(
    "products",
    "tg_media_group_id",
    "ALTER TABLE products ADD COLUMN tg_media_group_id TEXT",
  );
  await addColumnIfMissing(
    "products",
    "show_order_button",
    "ALTER TABLE products ADD COLUMN show_order_button INTEGER NOT NULL DEFAULT 0",
  );
  await addColumnIfMissing(
    "products",
    "image_width",
    "ALTER TABLE products ADD COLUMN image_width INTEGER",
  );
  await addColumnIfMissing(
    "products",
    "image_height",
    "ALTER TABLE products ADD COLUMN image_height INTEGER",
  );

  await db.execute(
    "CREATE UNIQUE INDEX IF NOT EXISTS idx_products_tg_group ON products(tg_media_group_id) WHERE tg_media_group_id IS NOT NULL",
  );

  await db.execute(`
    CREATE TABLE IF NOT EXISTS chat_state (
      chat_id INTEGER PRIMARY KEY,
      last_product_id INTEGER,
      updated_at INTEGER NOT NULL
    )
  `);

  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS gallery_photos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      url TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_gallery_sort ON gallery_photos(sort_order, id);
  `);
}

export function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = migrate();
  }
  return schemaReady;
}

export default db;
