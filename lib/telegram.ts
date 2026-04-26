const API_BASE = "https://api.telegram.org";

export type TgPhotoSize = {
  file_id: string;
  file_unique_id: string;
  width: number;
  height: number;
  file_size?: number;
};

export type TgVideo = {
  file_id: string;
  file_unique_id: string;
  duration: number;
  width: number;
  height: number;
  mime_type?: string;
  file_size?: number;
};

export type TgMessage = {
  message_id: number;
  from?: { id: number; is_bot: boolean; username?: string };
  chat: { id: number; type: string };
  date: number;
  caption?: string;
  text?: string;
  media_group_id?: string;
  photo?: TgPhotoSize[];
  video?: TgVideo;
};

export type TgUpdate = {
  update_id: number;
  message?: TgMessage;
  channel_post?: TgMessage;
  edited_message?: TgMessage;
};

export function isAuthorizedChat(chatId: number): boolean {
  const allowed = (process.env.TELEGRAM_ALLOWED_CHAT_IDS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map(Number);
  return allowed.length > 0 && allowed.includes(chatId);
}

function botToken(): string {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN is not set");
  return token;
}

export async function sendMessage(
  chatId: number,
  text: string,
): Promise<void> {
  const token = botToken();
  await fetch(`${API_BASE}/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  }).catch(() => {});
}

type TgFile = { file_id: string; file_path: string; file_size?: number };

export async function getFilePath(fileId: string): Promise<string> {
  const token = botToken();
  const res = await fetch(`${API_BASE}/bot${token}/getFile?file_id=${fileId}`);
  if (!res.ok) throw new Error(`Telegram getFile failed: ${res.status}`);
  const data = (await res.json()) as { ok: boolean; result: TgFile };
  if (!data.ok) throw new Error("Telegram getFile not ok");
  return data.result.file_path;
}

export async function downloadFile(filePath: string): Promise<{
  buffer: Buffer;
  mimeType: string;
}> {
  const token = botToken();
  const res = await fetch(`${API_BASE}/file/bot${token}/${filePath}`);
  if (!res.ok) throw new Error(`Telegram file download failed: ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  const mimeType = res.headers.get("content-type") ?? "application/octet-stream";
  return { buffer, mimeType };
}

export type ParsedCaption = {
  name: string;
  recipe: string;
};

export function parseCaption(caption: string | undefined): ParsedCaption | null {
  if (!caption) return null;
  const trimmed = caption.trim();
  if (!trimmed) return null;
  const blank = trimmed.search(/\n\s*\n/);
  if (blank === -1) {
    return { name: trimmed.slice(0, 200), recipe: "" };
  }
  const name = trimmed.slice(0, blank).trim();
  const recipe = trimmed.slice(blank).trim();
  return { name: name.slice(0, 200), recipe };
}

export function pickLargestPhoto(photos: TgPhotoSize[]): TgPhotoSize {
  return photos.reduce((a, b) => (a.width * a.height >= b.width * b.height ? a : b));
}
