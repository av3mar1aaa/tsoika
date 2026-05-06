import db, { ensureSchema } from "./db";

export async function setLastProductForChat(
  chatId: number,
  productId: number,
): Promise<void> {
  await ensureSchema();
  const now = Date.now();
  await db.execute({
    sql: `INSERT INTO chat_state (chat_id, last_product_id, updated_at)
          VALUES (?, ?, ?)
          ON CONFLICT(chat_id) DO UPDATE SET
            last_product_id = excluded.last_product_id,
            updated_at = excluded.updated_at`,
    args: [chatId, productId, now],
  });
}

const LAST_PRODUCT_TTL_MS = 24 * 60 * 60 * 1000;

export async function getLastProductForChat(
  chatId: number,
): Promise<number | null> {
  await ensureSchema();
  const res = await db.execute({
    sql: "SELECT last_product_id, updated_at FROM chat_state WHERE chat_id = ?",
    args: [chatId],
  });
  if (res.rows.length === 0) return null;
  const row = res.rows[0] as Record<string, unknown>;
  const updatedAt = Number(row.updated_at ?? 0);
  if (Date.now() - updatedAt > LAST_PRODUCT_TTL_MS) return null;
  const v = row.last_product_id;
  if (v == null) return null;
  return Number(v);
}
