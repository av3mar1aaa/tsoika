/**
 * Резервная копия локальной SQLite-базы в Yandex Object Storage.
 * Запускается таймером на сервере:
 *
 *   npm run backup-db
 *
 * Делает консистентный снимок через VACUUM INTO (не мешает работающему сайту),
 * жмёт gzip и кладёт как backups/app-YYYY-MM-DD-HHMM.db.gz.
 * Копии старше BACKUP_RETENTION_DAYS удаляются.
 *
 * Пишет в BACKUP_BUCKET — это должен быть ОТДЕЛЬНЫЙ приватный бакет.
 * Бакет с фотографиями (YC_BUCKET) открыт на публичное чтение, дамп базы
 * там скачал бы кто угодно, зная дату.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import zlib from "node:zlib";
import { promisify } from "node:util";
import {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import db from "../lib/db";

const gzip = promisify(zlib.gzip);
const RETENTION_DAYS = Number(process.env.BACKUP_RETENTION_DAYS ?? 14);
const PREFIX = "backups/";

function backupBucket(): string {
  const bucket = process.env.BACKUP_BUCKET?.trim();
  if (!bucket) {
    throw new Error(
      "BACKUP_BUCKET не задан. Создайте отдельный ПРИВАТНЫЙ бакет " +
        "(например tsoika-backups) и укажите его в .env.local",
    );
  }
  if (bucket === process.env.YC_BUCKET?.trim()) {
    throw new Error(
      `BACKUP_BUCKET совпадает с YC_BUCKET (${bucket}). Бакет с фото открыт ` +
        "на публичное чтение — дамп базы туда класть нельзя.",
    );
  }
  return bucket;
}

function client(): S3Client {
  return new S3Client({
    region: "ru-central1",
    endpoint: "https://storage.yandexcloud.net",
    credentials: {
      accessKeyId: process.env.YC_ACCESS_KEY_ID!,
      secretAccessKey: process.env.YC_SECRET_ACCESS_KEY!,
    },
  });
}

async function main() {
  if (process.env.TURSO_DATABASE_URL?.trim()) {
    throw new Error(
      "TURSO_DATABASE_URL задан — бэкапить нужно локальный файл, снимите переменную",
    );
  }
  const bucket = backupBucket();

  const snapshot = path.join(os.tmpdir(), `tsoika-snapshot-${process.pid}.db`);
  if (fs.existsSync(snapshot)) fs.rmSync(snapshot);

  await db.execute(`VACUUM INTO '${snapshot.replaceAll("'", "''")}'`);
  const raw = fs.readFileSync(snapshot);
  fs.rmSync(snapshot);

  const packed = await gzip(raw, { level: 9 });
  const key = `${PREFIX}app-${stamp()}.db.gz`;
  await client().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: packed,
      ContentType: "application/gzip",
    }),
  );

  console.log(
    `${bucket}/${key} — ${(raw.length / 1024).toFixed(0)} КБ -> ${(packed.length / 1024).toFixed(0)} КБ`,
  );

  const removed = await prune(bucket);
  if (removed > 0) console.log(`Удалено старых копий: ${removed}`);
}

function stamp(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())}-${p(d.getUTCHours())}${p(d.getUTCMinutes())}`;
}

async function prune(bucket: string): Promise<number> {
  const s3 = client();
  const cutoff = Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000;

  let token: string | undefined;
  let removed = 0;
  do {
    const res = await s3.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: PREFIX,
        ContinuationToken: token,
      }),
    );
    for (const o of res.Contents ?? []) {
      if (!o.Key || !o.LastModified) continue;
      if (o.LastModified.getTime() >= cutoff) continue;
      await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: o.Key }));
      removed++;
    }
    token = res.IsTruncated ? res.NextContinuationToken : undefined;
  } while (token);
  return removed;
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
