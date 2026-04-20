import db, { ensureSchema } from "./db";

export type MediaKind = "image" | "video";

export type ProductMedia = {
  id: number;
  product_id: number;
  kind: MediaKind;
  url: string;
  sort_order: number;
  created_at: number;
};

function rowToMedia(row: Record<string, unknown>): ProductMedia {
  return {
    id: Number(row.id),
    product_id: Number(row.product_id),
    kind: row.kind as MediaKind,
    url: String(row.url),
    sort_order: Number(row.sort_order),
    created_at: Number(row.created_at),
  };
}

export async function listMediaByProduct(
  productId: number,
): Promise<ProductMedia[]> {
  await ensureSchema();
  const res = await db.execute({
    sql: "SELECT * FROM product_media WHERE product_id = ? ORDER BY sort_order ASC, id ASC",
    args: [productId],
  });
  return res.rows.map((r) => rowToMedia(r as Record<string, unknown>));
}

export async function getMedia(id: number): Promise<ProductMedia | null> {
  await ensureSchema();
  const res = await db.execute({
    sql: "SELECT * FROM product_media WHERE id = ?",
    args: [id],
  });
  if (res.rows.length === 0) return null;
  return rowToMedia(res.rows[0] as Record<string, unknown>);
}

export async function createMedia(input: {
  product_id: number;
  kind: MediaKind;
  url: string;
}): Promise<ProductMedia> {
  await ensureSchema();
  const now = Date.now();
  const maxRes = await db.execute({
    sql: "SELECT COALESCE(MAX(sort_order), -1) AS m FROM product_media WHERE product_id = ?",
    args: [input.product_id],
  });
  const maxRow = maxRes.rows[0] as Record<string, unknown>;
  const sortOrder = Number(maxRow.m) + 1;

  const res = await db.execute({
    sql: "INSERT INTO product_media (product_id, kind, url, sort_order, created_at) VALUES (?, ?, ?, ?, ?) RETURNING *",
    args: [input.product_id, input.kind, input.url, sortOrder, now],
  });
  return rowToMedia(res.rows[0] as Record<string, unknown>);
}

export async function deleteMedia(id: number): Promise<ProductMedia | null> {
  const row = await getMedia(id);
  if (!row) return null;
  await db.execute({
    sql: "DELETE FROM product_media WHERE id = ?",
    args: [id],
  });
  return row;
}
