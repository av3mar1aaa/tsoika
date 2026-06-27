export const CATEGORY_GROUPS = [
  {
    name: "Выпечка",
    children: ["Сладкая", "Несладкая выпечка"],
  },
  {
    name: "Новогодняя выпечка",
    children: ["Печенье, пряники", "Кексы", "Штоллены"],
  },
  { name: "Кексы и маффины" },
  { name: "Печенье" },
  { name: "Пироги" },
  { name: "Творожные запеканки" },
  { name: "Торты и пирожные" },
  { name: "Выпечка БЕЗ (без глютена, яиц, лактозы, постная)" },
  { name: "Рулеты и полена" },
  { name: "Изделия из заварного теста" },
  { name: "Тарты и тарталетки" },
  { name: "Другие сладости (нуга, зефир, карамель и др.)" },
] as const;

export const CATEGORIES = CATEGORY_GROUPS.flatMap((group) => [
  group.name,
  ...("children" in group ? group.children : []),
]);

export type Category = (typeof CATEGORIES)[number];

export function isValidCategory(value: unknown): value is Category {
  return (
    typeof value === "string" &&
    (CATEGORIES as readonly string[]).includes(value)
  );
}

export function categorySlug(name: string): string {
  return encodeURIComponent(name);
}

export function categoriesForFilter(value: string | null): string[] {
  if (!value || !isValidCategory(value)) return [];
  const group = CATEGORY_GROUPS.find((g) => g.name === value);
  return group
    ? [group.name, ...("children" in group ? group.children : [])]
    : [value];
}

const CATEGORY_KEYWORDS: Array<{ category: Category; words: string[] }> = [
  {
    category: "Выпечка БЕЗ (без глютена, яиц, лактозы, постная)",
    words: [
      "без глютена",
      "безглютен",
      "без яиц",
      "без яйца",
      "без лактозы",
      "безлактоз",
      "веган",
      "постн",
    ],
  },
  {
    category: "Печенье, пряники",
    words: ["пряник", "прянич", "pepparkakor", "pain d'epices"],
  },
  {
    category: "Штоллены",
    words: ["штоллен", "stollen"],
  },
  {
    category: "Кексы",
    words: ["рождественск кекс", "новогодн кекс"],
  },
  {
    category: "Новогодняя выпечка",
    words: ["новогод", "рождествен", "панеттоне", "panettone"],
  },
  {
    category: "Изделия из заварного теста",
    words: ["эклер", "профитрол", "заварное тесто", "заварного теста", "гужер"],
  },
  {
    category: "Несладкая выпечка",
    words: [
      "неслад",
      "закусоч",
      "мясн",
      "рыбн",
      "овощн",
      "куриц",
      "ветчин",
      "гриб",
      "картоф",
      "киш",
      "пампуш",
      "эчпочмак",
      "расстегай",
      "пирожки с курицей",
      "лепеш",
      "хлебцы",
      "сырные крекеры",
    ],
  },
  {
    category: "Тарты и тарталетки",
    words: ["тарталет", "тарт ", "тарт\n", "тарт.", "тарт,"],
  },
  {
    category: "Рулеты и полена",
    words: ["рулет", "полено"],
  },
  {
    category: "Творожные запеканки",
    words: ["запеканк", "сырник", "творожный пудинг"],
  },
  {
    category: "Торты и пирожные",
    words: [
      "торт",
      "пирожн",
      "капкейк",
      "муссов",
      "бисквит",
      "медовик",
      "захер",
      "эстерхази",
      "опера",
      "фрезье",
      "брауни",
      "гато",
      "макарон",
      "шарлотт",
    ],
  },
  {
    category: "Кексы и маффины",
    words: [
      "маффин",
      "кекс",
      "капкейк",
      "мадлен",
      "финансье",
      "банановый хлеб",
      "кулич",
    ],
  },
  {
    category: "Печенье",
    words: [
      "печенье",
      "печен",
      "куки",
      "cookies",
      "сабле",
      "бискотти",
      "кантуч",
      "крекер",
      "тюиль",
      "брукис",
      "песочн",
      "палочк",
    ],
  },
  {
    category: "Пироги",
    words: ["пирог", "галет", "шарлотк", "штрудель", "перевертыш"],
  },
  {
    category: "Сладкая",
    words: [
      "булочк",
      "ватрушк",
      "синнабон",
      "бриош",
      "плюшк",
      "слойк",
      "хворост",
      "оладьи",
      "блины",
      "блинчики",
      "крепы",
      "рогалик",
      "пирожк",
      "плетенк",
      "коврижк",
    ],
  },
  {
    category: "Другие сладости (нуга, зефир, карамель и др.)",
    words: [
      "нуга",
      "зефир",
      "карамел",
      "мармелад",
      "пастил",
      "конфет",
      "безе",
      "меренг",
      "маршмеллоу",
      "пралине",
      "цукат",
      "глазур",
    ],
  },
];

export function inferCategoryFromText(...parts: Array<string | null | undefined>) {
  const texts = parts.map((part) => normalizeCategoryText(part ?? ""));

  for (const text of texts) {
    if (!text) continue;
    for (const item of CATEGORY_KEYWORDS) {
      if (
        item.words.some((word) => text.includes(normalizeCategoryText(word)))
      ) {
        return item.category;
      }
    }
  }

  return null;
}

function normalizeCategoryText(value: string): string {
  return value
    .toLocaleLowerCase("ru")
    .replaceAll("ё", "е")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
