import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

const ENDPOINT = "https://storage.yandexcloud.net";
const REGION = "ru-central1";

function getBucket(): string {
  const bucket = process.env.YC_BUCKET;
  if (!bucket) throw new Error("YC_BUCKET is not set in .env.local");
  return bucket;
}

function getClient(): S3Client {
  const accessKeyId = process.env.YC_ACCESS_KEY_ID;
  const secretAccessKey = process.env.YC_SECRET_ACCESS_KEY;
  if (!accessKeyId || !secretAccessKey) {
    throw new Error(
      "YC_ACCESS_KEY_ID / YC_SECRET_ACCESS_KEY must be set in .env.local",
    );
  }
  return new S3Client({
    region: REGION,
    endpoint: ENDPOINT,
    forcePathStyle: false,
    credentials: { accessKeyId, secretAccessKey },
  });
}

export function publicUrl(key: string): string {
  return `${ENDPOINT}/${getBucket()}/${key}`;
}

export async function putObject(
  key: string,
  body: Buffer,
  contentType: string,
): Promise<string> {
  const client = getClient();
  await client.send(
    new PutObjectCommand({
      Bucket: getBucket(),
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );
  return publicUrl(key);
}

export async function deleteObject(keyOrUrl: string): Promise<void> {
  const key = extractKey(keyOrUrl);
  if (!key) return;
  const client = getClient();
  await client
    .send(new DeleteObjectCommand({ Bucket: getBucket(), Key: key }))
    .catch(() => {});
}

export function extractKey(urlOrKey: string): string | null {
  if (!urlOrKey) return null;
  const prefix = `${ENDPOINT}/${getBucket()}/`;
  if (urlOrKey.startsWith(prefix)) return urlOrKey.slice(prefix.length);
  if (!urlOrKey.startsWith("http")) return urlOrKey;
  return null;
}

export const STORAGE_HOST = "storage.yandexcloud.net";
