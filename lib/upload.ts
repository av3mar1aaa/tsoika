import crypto from "node:crypto";
import sharp from "sharp";
import { deleteObject, putObject } from "./storage";

const ALLOWED_VIDEO_TYPES = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/ogg",
]);

const EXT_BY_TYPE: Record<string, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
  "video/ogg": "ogv",
};

const MAX_VIDEO_BYTES = 200 * 1024 * 1024;

export type MediaKind = "image" | "video";

export async function uploadImage(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Файл должен быть изображением");
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  const processed = await sharp(buffer)
    .rotate()
    .resize({
      width: 1600,
      height: 1600,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 82 })
    .toBuffer();

  const key = `images/${crypto.randomBytes(8).toString("hex")}.webp`;
  return putObject(key, processed, "image/webp");
}

export async function uploadVideo(file: File): Promise<string> {
  if (!ALLOWED_VIDEO_TYPES.has(file.type)) {
    throw new Error(
      "Поддерживаются видео в форматах MP4, WebM, MOV, OGV",
    );
  }
  if (file.size > MAX_VIDEO_BYTES) {
    throw new Error(
      `Видео больше ${Math.round(MAX_VIDEO_BYTES / 1024 / 1024)} МБ`,
    );
  }
  const ext = EXT_BY_TYPE[file.type] ?? "mp4";
  const buffer = Buffer.from(await file.arrayBuffer());
  const key = `videos/${crypto.randomBytes(8).toString("hex")}.${ext}`;
  return putObject(key, buffer, file.type);
}

export async function deleteUpload(url: string): Promise<void> {
  await deleteObject(url);
}
