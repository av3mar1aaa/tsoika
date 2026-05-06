import { NextResponse, after } from "next/server";
import crypto from "node:crypto";
import sharp from "sharp";
import {
  type TgUpdate,
  type TgMessage,
  type TgCallbackQuery,
  answerCallbackQuery,
  downloadFile,
  editMessageText,
  getFilePath,
  isAuthorizedChat,
  parseCaption,
  pickLargestPhoto,
  sendMessage,
} from "@/lib/telegram";
import { putObject } from "@/lib/storage";
import {
  createProductFromTelegram,
  getProduct,
  getProductByTgMediaGroupId,
  setProductOrderButton,
  updateProduct,
} from "@/lib/products";
import { createMedia } from "@/lib/media";
import { appendToFirstRecipeOfProduct, createRecipe } from "@/lib/recipes";
import {
  getLastProductForChat,
  setLastProductForChat,
} from "@/lib/chat-state";

export const runtime = "nodejs";
export const maxDuration = 300;

function verifyWebhookSecret(request: Request): boolean {
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!expected) return true;
  const got = request.headers.get("x-telegram-bot-api-secret-token");
  return got === expected;
}

export async function POST(request: Request) {
  if (!verifyWebhookSecret(request)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let update: TgUpdate;
  try {
    update = (await request.json()) as TgUpdate;
  } catch {
    return NextResponse.json({ ok: true });
  }

  if (update.callback_query) {
    const cb = update.callback_query;
    after(async () => {
      try {
        await handleCallback(cb);
      } catch (e) {
        console.error("[telegram] callback handler failed:", e);
      }
    });
    return NextResponse.json({ ok: true });
  }

  const message = update.message ?? update.channel_post ?? update.edited_message;
  if (!message) {
    return NextResponse.json({ ok: true });
  }

  if (!isAuthorizedChat(message.chat.id)) {
    return NextResponse.json({ ok: true });
  }

  after(async () => {
    try {
      await handleMessage(message);
    } catch (e) {
      const err = e instanceof Error ? e.message : "Ошибка";
      console.error("[telegram] handler failed:", err, e);
      await sendMessage(message.chat.id, `❌ Ошибка: ${err}`);
    }
  });

  return NextResponse.json({ ok: true });
}

async function handleCallback(cb: TgCallbackQuery): Promise<void> {
  const fromId = cb.from.id;
  if (!isAuthorizedChat(fromId)) {
    await answerCallbackQuery(cb.id);
    return;
  }
  const data = cb.data ?? "";
  const match = /^order:([01]):(\d+)$/.exec(data);
  if (!match) {
    await answerCallbackQuery(cb.id);
    return;
  }
  const show = match[1] === "1";
  const productId = Number(match[2]);
  const product = await getProduct(productId);
  if (!product) {
    await answerCallbackQuery(cb.id, "Десерт не найден");
    return;
  }
  await setProductOrderButton(productId, show);
  await answerCallbackQuery(
    cb.id,
    show ? "Кнопка добавлена" : "Без кнопки",
  );
  if (cb.message) {
    await editMessageText(
      cb.message.chat.id,
      cb.message.message_id,
      show
        ? `✅ К «${product.name}» добавлена кнопка «Заказать»`
        : `✅ «${product.name}» опубликован без кнопки «Заказать»`,
    );
  }
}

async function handleMessage(message: TgMessage): Promise<void> {
  const hasPhoto = Array.isArray(message.photo) && message.photo.length > 0;
  const hasVideo = !!message.video;

  if (!hasPhoto && !hasVideo) {
    if (message.text) {
      await handleTextContinuation(message);
    }
    return;
  }

  const groupId = message.media_group_id ?? null;
  const parsed = parseCaption(message.caption);

  let mediaKind: "image" | "video";
  let publicUrl: string;
  let imageWidth: number | null = null;
  let imageHeight: number | null = null;

  if (hasPhoto) {
    const photo = pickLargestPhoto(message.photo!);
    const uploaded = await uploadPhoto(photo.file_id);
    publicUrl = uploaded.url;
    imageWidth = uploaded.width;
    imageHeight = uploaded.height;
    mediaKind = "image";
  } else {
    const video = message.video!;
    publicUrl = await uploadVideo(video.file_id, video.mime_type);
    mediaKind = "video";
  }

  const existing = groupId
    ? await getProductByTgMediaGroupId(groupId)
    : null;

  let product = existing;

  if (!product) {
    const initialName =
      parsed?.name && parsed.name.length > 0 ? parsed.name : "Без названия";
    const result = await createProductFromTelegram({
      name: initialName,
      description: null,
      image_path: publicUrl,
      image_width: imageWidth,
      image_height: imageHeight,
      tg_media_group_id: groupId,
    });
    product = result.product;
    if (result.created && parsed?.recipe) {
      await createRecipe({
        product_id: product.id,
        title: "Рецепт",
        ingredients: "",
        instructions: parsed.recipe,
      });
    }
    if (result.created) {
      await sendMessage(
        message.chat.id,
        `Добавить под «${initialName}» кнопку «Заказать»?`,
        {
          inline_keyboard: [
            [
              { text: "✅ Да", callback_data: `order:1:${product.id}` },
              { text: "🚫 Нет", callback_data: `order:0:${product.id}` },
            ],
          ],
        },
      );
    }
  } else if (parsed) {
    await updateProduct(product.id, {
      name: parsed.name || product.name,
      description: product.description,
    });
    if (parsed.recipe) {
      await createRecipe({
        product_id: product.id,
        title: "Рецепт",
        ingredients: "",
        instructions: parsed.recipe,
      });
    }
  }

  await createMedia({
    product_id: product.id,
    kind: mediaKind,
    url: publicUrl,
  });

  await setLastProductForChat(message.chat.id, product.id);
}

async function handleTextContinuation(message: TgMessage): Promise<void> {
  const text = (message.text ?? "").trim();
  if (!text) return;

  const lastId = await getLastProductForChat(message.chat.id);
  if (!lastId) {
    await sendMessage(
      message.chat.id,
      "Сначала пришлите фото или видео с подписью:\n— 1-я строка: название\n— через пустую строку: рецепт",
    );
    return;
  }
  await appendToFirstRecipeOfProduct(lastId, text);
  await sendMessage(message.chat.id, "📝 Дополнено к последнему десерту");
}

async function uploadPhoto(
  fileId: string,
): Promise<{ url: string; width: number; height: number }> {
  const filePath = await getFilePath(fileId);
  const { buffer } = await downloadFile(filePath);
  const { data, info } = await sharp(buffer)
    .rotate()
    .resize({
      width: 1600,
      height: 1600,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 82 })
    .toBuffer({ resolveWithObject: true });
  const key = `images/${crypto.randomBytes(8).toString("hex")}.webp`;
  const url = await putObject(key, data, "image/webp");
  return { url, width: info.width, height: info.height };
}

async function uploadVideo(
  fileId: string,
  mimeType: string | undefined,
): Promise<string> {
  const filePath = await getFilePath(fileId);
  const { buffer, mimeType: contentType } = await downloadFile(filePath);
  const finalType = mimeType || contentType || "video/mp4";
  const ext = guessExt(filePath, finalType);
  const key = `videos/${crypto.randomBytes(8).toString("hex")}.${ext}`;
  return putObject(key, buffer, finalType);
}

function guessExt(filePath: string, mime: string): string {
  const dot = filePath.lastIndexOf(".");
  if (dot !== -1 && dot < filePath.length - 1) {
    return filePath.slice(dot + 1).toLowerCase();
  }
  if (mime.includes("mp4")) return "mp4";
  if (mime.includes("webm")) return "webm";
  if (mime.includes("quicktime")) return "mov";
  return "mp4";
}
