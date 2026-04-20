import crypto from "node:crypto";
import sharp from "sharp";
import db, { ensureSchema } from "../lib/db";
import { putObject } from "../lib/storage";

async function makePlaceholder(label: string, tint: string): Promise<string> {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#fff9fb"/>
          <stop offset="100%" stop-color="${tint}"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="1200" fill="url(#g)"/>
      <text x="50%" y="52%" text-anchor="middle"
        font-family="Georgia, serif" font-size="120"
        fill="#8e3a5f" font-weight="600">${label}</text>
    </svg>
  `;
  const webp = await sharp(Buffer.from(svg)).webp({ quality: 85 }).toBuffer();
  const key = `images/${crypto.randomBytes(8).toString("hex")}.webp`;
  return putObject(key, webp, "image/webp");
}

const samples = [
  {
    name: "Эклер с ванильным кремом",
    description:
      "Классический французский эклер с нежным заварным кремом и шоколадной глазурью.",
    tint: "#f4a6c0",
    recipes: [
      {
        title: "Заварное тесто",
        ingredients:
          "125 мл молока\n125 мл воды\n110 г сливочного масла\n150 г муки\n4 яйца\nщепотка соли и сахара",
        instructions:
          "Доведите до кипения молоко, воду, масло, соль и сахар.\nВсыпьте муку, энергично мешайте 2 минуты.\nСнимите с огня, по одному вмешивайте яйца до гладкого теста.\nОтсадите эклеры на противень и выпекайте 30 минут при 180 °C.",
      },
      {
        title: "Ванильный крем",
        ingredients: "500 мл молока\n4 желтка\n120 г сахара\n40 г крахмала\n1 стручок ванили",
        instructions:
          "Нагрейте молоко с ванилью.\nВзбейте желтки с сахаром и крахмалом.\nВлейте горячее молоко, верните на огонь и доведите до загустения.\nОстудите и наполните эклеры.",
      },
    ],
  },
  {
    name: "Макарон малиновый",
    description: "Хрустящая скорлупка и нежный малиновый ганаш.",
    tint: "#f9d0e0",
    recipes: [
      {
        title: "Основа",
        ingredients:
          "150 г миндальной муки\n150 г сахарной пудры\n110 г белков\n150 г сахара\n40 мл воды",
        instructions:
          "Смешайте миндальную муку с пудрой и половиной белков.\nСварите сироп до 118 °C, влейте во взбитые белки.\nСоедините меренгу с миндальной массой, отсадите кружки.\nОстановите 30 минут и выпекайте 14 минут при 150 °C.",
      },
    ],
  },
  {
    name: "Тирамису",
    description: "Итальянский десерт с маскарпоне, кофе и какао.",
    tint: "#fce7ef",
    recipes: [
      {
        title: "Классический",
        ingredients:
          "500 г маскарпоне\n4 яйца\n100 г сахара\n200 мл эспрессо\n200 г савоярди\nкакао для посыпки",
        instructions:
          "Взбейте желтки с половиной сахара, добавьте маскарпоне.\nОтдельно взбейте белки с оставшимся сахаром, соедините.\nПечёные савоярди окуните в кофе и выложите слоями, чередуя с кремом.\nПосыпьте какао и уберите в холодильник на 4 часа.",
      },
    ],
  },
];

async function main() {
  await ensureSchema();
  for (const s of samples) {
    const imageUrl = await makePlaceholder(s.name, s.tint);
    const productResult = await db.execute({
      sql: "INSERT INTO products (name, description, image_path, created_at) VALUES (?, ?, ?, ?) RETURNING id",
      args: [s.name, s.description, imageUrl, Date.now()],
    });
    const productId = Number(
      (productResult.rows[0] as Record<string, unknown>).id,
    );

    for (const r of s.recipes) {
      await db.execute({
        sql: "INSERT INTO recipes (product_id, title, ingredients, instructions, created_at) VALUES (?, ?, ?, ?, ?)",
        args: [
          productId,
          r.title,
          r.ingredients,
          r.instructions,
          Date.now(),
        ],
      });
    }
    console.log(`+ ${s.name}  →  ${imageUrl}`);
  }
  console.log("Готово.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
