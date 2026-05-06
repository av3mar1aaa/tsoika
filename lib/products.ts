import db, { ensureSchema } from "./db";

export type Product = {
  id: number;
  name: string;
  description: string | null;
  image_path: string;
  created_at: number;
  show_order_button: boolean;
};

function rowToProduct(row: Record<string, unknown>): Product {
  return {
    id: Number(row.id),
    name: String(row.name),
    description: row.description == null ? null : String(row.description),
    image_path: String(row.image_path),
    created_at: Number(row.created_at),
    show_order_button: Number(row.show_order_button ?? 0) === 1,
  };
}

export async function setProductOrderButton(
  id: number,
  show: boolean,
): Promise<void> {
  await ensureSchema();
  await db.execute({
    sql: "UPDATE products SET show_order_button = ? WHERE id = ?",
    args: [show ? 1 : 0, id],
  });
}

export async function listProducts(input?: {
  limit?: number;
  offset?: number;
}): Promise<Product[]> {
  await ensureSchema();
  const limit = input?.limit ?? 1000;
  const offset = input?.offset ?? 0;
  const res = await db.execute({
    sql: "SELECT * FROM products ORDER BY created_at DESC LIMIT ? OFFSET ?",
    args: [limit, offset],
  });
  return res.rows.map((r) => rowToProduct(r as Record<string, unknown>));
}

export async function countProducts(): Promise<number> {
  await ensureSchema();
  const res = await db.execute("SELECT COUNT(*) AS c FROM products");
  return Number((res.rows[0] as Record<string, unknown>).c ?? 0);
}

export async function getProduct(id: number): Promise<Product | null> {
  await ensureSchema();
  const res = await db.execute({
    sql: "SELECT * FROM products WHERE id = ?",
    args: [id],
  });
  if (res.rows.length === 0) return null;
  return rowToProduct(res.rows[0] as Record<string, unknown>);
}

export async function getProductByTgMediaGroupId(
  groupId: string,
): Promise<Product | null> {
  await ensureSchema();
  const res = await db.execute({
    sql: "SELECT * FROM products WHERE tg_media_group_id = ?",
    args: [groupId],
  });
  if (res.rows.length === 0) return null;
  return rowToProduct(res.rows[0] as Record<string, unknown>);
}

export async function createProductFromTelegram(input: {
  name: string;
  description: string | null;
  image_path: string;
  tg_media_group_id: string | null;
}): Promise<{ product: Product; created: boolean }> {
  await ensureSchema();
  const now = Date.now();
  try {
    const res = await db.execute({
      sql: "INSERT INTO products (name, description, image_path, created_at, tg_media_group_id) VALUES (?, ?, ?, ?, ?) RETURNING *",
      args: [
        input.name,
        input.description,
        input.image_path,
        now,
        input.tg_media_group_id,
      ],
    });
    return {
      product: rowToProduct(res.rows[0] as Record<string, unknown>),
      created: true,
    };
  } catch (e) {
    if (input.tg_media_group_id) {
      const existing = await getProductByTgMediaGroupId(
        input.tg_media_group_id,
      );
      if (existing) return { product: existing, created: false };
    }
    throw e;
  }
}


export async function createProduct(input: {
  name: string;
  description: string | null;
  image_path: string;
}): Promise<Product> {
  await ensureSchema();
  const now = Date.now();
  const res = await db.execute({
    sql: "INSERT INTO products (name, description, image_path, created_at) VALUES (?, ?, ?, ?) RETURNING *",
    args: [input.name, input.description, input.image_path, now],
  });
  return rowToProduct(res.rows[0] as Record<string, unknown>);
}

export async function updateProduct(
  id: number,
  input: {
    name: string;
    description: string | null;
    image_path?: string;
  },
): Promise<void> {
  await ensureSchema();
  if (input.image_path) {
    await db.execute({
      sql: "UPDATE products SET name = ?, description = ?, image_path = ? WHERE id = ?",
      args: [input.name, input.description, input.image_path, id],
    });
  } else {
    await db.execute({
      sql: "UPDATE products SET name = ?, description = ? WHERE id = ?",
      args: [input.name, input.description, id],
    });
  }
}

export async function deleteProduct(id: number): Promise<Product | null> {
  const product = await getProduct(id);
  if (!product) return null;
  await db.batch(
    [
      { sql: "DELETE FROM product_media WHERE product_id = ?", args: [id] },
      { sql: "DELETE FROM recipes WHERE product_id = ?", args: [id] },
      { sql: "DELETE FROM products WHERE id = ?", args: [id] },
    ],
    "write",
  );
  return product;
}
