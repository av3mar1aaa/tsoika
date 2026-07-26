/**
 * Сверяет ссылки в БД с содержимым бакета Object Storage.
 *
 *   npm run audit-media                       # только отчёт
 *   npm run audit-media -- --fix              # чинит битые ссылки в БД
 *   npm run audit-media -- --fix --delete-orphans
 *                                             # + удаляет файлы-сироты из бакета
 *                                             #   (копии сохраняются в backup/orphans/)
 *
 * Битая обложка товара: подставляется первое живое фото из его галереи
 * (строка галереи при этом удаляется, чтобы фото не дублировалось).
 * Если живых фото нет — товар только отмечается в отчёте, руками.
 */
import fs from "node:fs";
import path from "node:path";
import { S3Client, ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";
import db, { ensureSchema } from "../lib/db";
import { deleteObject, publicUrl } from "../lib/storage";

const ENDPOINT = "https://storage.yandexcloud.net";
const REGION = "ru-central1";

// Служебные префиксы бакета: на них нет ссылок из БД, но это не мусор.
const IGNORED_PREFIXES = ["backups/"];

type Row = Record<string, unknown>;

async function main() {
  const fix = process.argv.includes("--fix");
  const deleteOrphans = process.argv.includes("--delete-orphans");

  await ensureSchema();

  const bucketKeys = await listBucketKeys();
  console.log(`В бакете: ${bucketKeys.size} объектов`);

  const prefix = publicUrl("").replace(/\/$/, "") + "/";
  const isBroken = (url: string) =>
    url.startsWith(prefix) && !bucketKeys.has(url.slice(prefix.length));

  const referenced = new Set<string>();
  const track = (url: string) => {
    if (url.startsWith(prefix)) referenced.add(url.slice(prefix.length));
  };

  const products = (
    await db.execute("SELECT id, name, image_path FROM products ORDER BY id")
  ).rows as Row[];
  const media = (
    await db.execute(
      "SELECT id, product_id, kind, url, sort_order FROM product_media ORDER BY product_id, sort_order, id",
    )
  ).rows as Row[];
  const gallery = await tryQuery("SELECT id, url FROM gallery_photos ORDER BY id");

  for (const p of products) track(String(p.image_path));
  for (const m of media) track(String(m.url));
  for (const g of gallery) track(String(g.url));

  const brokenCovers = products.filter((p) => isBroken(String(p.image_path)));
  const brokenMedia = media.filter((m) => isBroken(String(m.url)));
  const brokenGallery = gallery.filter((g) => isBroken(String(g.url)));
  const orphanKeys = [...bucketKeys].filter((k) => !referenced.has(k)).sort();

  console.log(
    `Ссылок в БД: ${referenced.size} (товары ${products.length}, медиа ${media.length}, галерея ${gallery.length})`,
  );
  console.log(`Битых обложек: ${brokenCovers.length}`);
  console.log(`Битых медиа: ${brokenMedia.length}`);
  console.log(`Битых строк галереи: ${brokenGallery.length}`);
  console.log(`Файлов-сирот в бакете: ${orphanKeys.length}`);

  const liveMediaByProduct = new Map<number, Row[]>();
  for (const m of media) {
    if (isBroken(String(m.url))) continue;
    const pid = Number(m.product_id);
    const list = liveMediaByProduct.get(pid) ?? [];
    list.push(m);
    liveMediaByProduct.set(pid, list);
  }
  const brokenMediaIds = new Set(brokenMedia.map((m) => Number(m.id)));

  console.log("\n--- Битые обложки ---");
  const unfixable: Row[] = [];
  for (const p of brokenCovers) {
    const replacement = (liveMediaByProduct.get(Number(p.id)) ?? []).find(
      (m) => m.kind === "image",
    );
    if (!replacement) {
      unfixable.push(p);
      console.log(`  ${p.id} «${p.name}» — замены нет, нужна ручная загрузка`);
      continue;
    }
    console.log(
      `  ${p.id} «${p.name}» -> media ${replacement.id} (${String(replacement.url).slice(prefix.length)})`,
    );
    if (fix) {
      await db.batch(
        [
          {
            sql: "UPDATE products SET image_path = ?, image_width = NULL, image_height = NULL WHERE id = ?",
            args: [String(replacement.url), Number(p.id)],
          },
          {
            sql: "DELETE FROM product_media WHERE id = ?",
            args: [Number(replacement.id)],
          },
        ],
        "write",
      );
    }
  }
  if (brokenCovers.length === 0) console.log("  нет");

  console.log("\n--- Битые медиа ---");
  for (const m of brokenMedia) {
    console.log(
      `  media ${m.id} (товар ${m.product_id}, ${m.kind}) ${String(m.url).slice(prefix.length)}`,
    );
  }
  if (brokenMedia.length === 0) console.log("  нет");
  if (fix && brokenMediaIds.size > 0) {
    await db.batch(
      [...brokenMediaIds].map((id) => ({
        sql: "DELETE FROM product_media WHERE id = ?",
        args: [id],
      })),
      "write",
    );
  }

  if (gallery.length > 0) {
    console.log("\n--- Битые строки галереи ---");
    for (const g of brokenGallery) console.log(`  gallery ${g.id}`);
    if (brokenGallery.length === 0) console.log("  нет");
    if (fix && brokenGallery.length > 0) {
      await db.batch(
        brokenGallery.map((g) => ({
          sql: "DELETE FROM gallery_photos WHERE id = ?",
          args: [Number(g.id)],
        })),
        "write",
      );
    }
  }

  console.log("\n--- Файлы-сироты ---");
  for (const k of orphanKeys) console.log(`  ${k}`);
  if (orphanKeys.length === 0) console.log("  нет");

  if (deleteOrphans && orphanKeys.length > 0) {
    if (!fix) {
      console.log("\n--delete-orphans требует --fix, пропущено");
    } else {
      const dir = path.join(process.cwd(), "backup", "orphans");
      fs.mkdirSync(dir, { recursive: true });
      const client = new S3Client({
        region: REGION,
        endpoint: ENDPOINT,
        credentials: {
          accessKeyId: process.env.YC_ACCESS_KEY_ID!,
          secretAccessKey: process.env.YC_SECRET_ACCESS_KEY!,
        },
      });
      for (const key of orphanKeys) {
        const res = await client.send(
          new GetObjectCommand({ Bucket: process.env.YC_BUCKET!, Key: key }),
        );
        const bytes = Buffer.from(await res.Body!.transformToByteArray());
        const dest = path.join(dir, key.replace(/\//g, "_"));
        fs.writeFileSync(dest, bytes);
        await deleteObject(publicUrl(key));
        console.log(`  удалён ${key} (копия: backup/orphans/${path.basename(dest)})`);
      }
    }
  }

  if (!fix) {
    console.log("\nОтчёт без изменений. Запустите с --fix, чтобы применить.");
  } else {
    console.log("\nГотово.");
    if (unfixable.length > 0) {
      console.log(
        `Требуют ручной обложки: ${unfixable.map((p) => `${p.id} «${p.name}»`).join(", ")}`,
      );
    }
  }
}

async function tryQuery(sql: string): Promise<Row[]> {
  try {
    return (await db.execute(sql)).rows as Row[];
  } catch {
    return [];
  }
}

async function listBucketKeys(): Promise<Set<string>> {
  const client = new S3Client({
    region: REGION,
    endpoint: ENDPOINT,
    credentials: {
      accessKeyId: process.env.YC_ACCESS_KEY_ID!,
      secretAccessKey: process.env.YC_SECRET_ACCESS_KEY!,
    },
  });
  const keys = new Set<string>();
  let token: string | undefined;
  do {
    const res = await client.send(
      new ListObjectsV2Command({
        Bucket: process.env.YC_BUCKET!,
        ContinuationToken: token,
      }),
    );
    for (const o of res.Contents ?? []) {
      if (!o.Key) continue;
      if (IGNORED_PREFIXES.some((p) => o.Key!.startsWith(p))) continue;
      keys.add(o.Key);
    }
    token = res.IsTruncated ? res.NextContinuationToken : undefined;
  } while (token);
  return keys;
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
