export const CATEGORIES = [
  "Пирожные и торты",
  "Пироги",
  "Выпечка",
  "Печенье",
  "Кексы",
  "Запеканки, фланы, чизкейки",
  "Панеттоне",
  "Выпечка БЕЗ (без глютена, яиц, веган)",
  "Рулеты",
  "Тарты и тарталетки",
] as const;

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
