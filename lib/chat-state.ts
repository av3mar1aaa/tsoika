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

export async function getLastProductForChat(
  chatId: number,
): Promise<number | null> {
  await ensureSchema();
  const res = await db.execute({
    sql: "SELECT last_product_id FROM chat_state WHERE chat_id = ?",
    args: [chatId],
  });
  if (res.rows.length === 0) return null;
  const v = (res.rows[0] as Record<string, unknown>).last_product_id;
  if (v == null) return null;
  return Number(v);
}
