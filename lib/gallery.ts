import db, { ensureSchema } from "./db";

export type GalleryPhoto = {
  id: number;
  url: string;
  sort_order: number;
  created_at: number;
};

function rowToPhoto(row: Record<string, unknown>): GalleryPhoto {
  return {
    id: Number(row.id),
    url: String(row.url),
    sort_order: Number(row.sort_order),
    created_at: Number(row.created_at),
  };
}

export async function listGalleryPhotos(): Promise<GalleryPhoto[]> {
  await ensureSchema();
  const res = await db.execute(
    "SELECT * FROM gallery_photos ORDER BY sort_order ASC, id ASC",
  );
  return res.rows.map((r) => rowToPhoto(r as Record<string, unknown>));
}

export async function getGalleryPhoto(
  id: number,
): Promise<GalleryPhoto | null> {
  await ensureSchema();
  const res = await db.execute({
    sql: "SELECT * FROM gallery_photos WHERE id = ?",
    args: [id],
  });
  if (res.rows.length === 0) return null;
  return rowToPhoto(res.rows[0] as Record<string, unknown>);
}

export async function createGalleryPhoto(url: string): Promise<GalleryPhoto> {
  await ensureSchema();
  const now = Date.now();
  const maxRes = await db.execute(
    "SELECT COALESCE(MAX(sort_order), -1) AS m FROM gallery_photos",
  );
  const sortOrder =
    Number((maxRes.rows[0] as Record<string, unknown>).m ?? -1) + 1;
  const res = await db.execute({
    sql: "INSERT INTO gallery_photos (url, sort_order, created_at) VALUES (?, ?, ?) RETURNING *",
    args: [url, sortOrder, now],
  });
  return rowToPhoto(res.rows[0] as Record<string, unknown>);
}

export async function deleteGalleryPhoto(
  id: number,
): Promise<GalleryPhoto | null> {
  const photo = await getGalleryPhoto(id);
  if (!photo) return null;
  await db.execute({
    sql: "DELETE FROM gallery_photos WHERE id = ?",
    args: [id],
  });
  return photo;
}
