import { unstable_cache, revalidateTag } from "next/cache";
import { listProducts, countProducts, getProduct } from "./products";
import { listRecipesByProduct } from "./recipes";
import { listMediaByProduct } from "./media";

/**
 * Кеш публичных страниц.
 *
 * Каждый запрос к базе идёт через unstable_cache с тегом, а любая запись
 * (админка, Telegram-бот) сбрасывает теги через `revalidateProducts`.
 * Поэтому кеш живёт долго: устаревших данных пользователь не увидит,
 * а обновления появляются сразу после правки.
 *
 * Админка эти обёртки не использует — там нужны свежие данные всегда.
 */

export const TAG_PRODUCTS = "products";
export const productTag = (id: number) => `product:${id}`;

// Час — страховка на случай, если сброс тега почему-то не дошёл.
const TTL = 3600;

export const listProductsCached = unstable_cache(
  async (input?: Parameters<typeof listProducts>[0]) => listProducts(input),
  ["list-products"],
  { tags: [TAG_PRODUCTS], revalidate: TTL },
);

export const countProductsCached = unstable_cache(
  async (input?: Parameters<typeof countProducts>[0]) => countProducts(input),
  ["count-products"],
  { tags: [TAG_PRODUCTS], revalidate: TTL },
);

export const getProductCached = unstable_cache(
  async (id: number) => getProduct(id),
  ["get-product"],
  { tags: [TAG_PRODUCTS], revalidate: TTL },
);

export const listRecipesByProductCached = unstable_cache(
  async (id: number) => listRecipesByProduct(id),
  ["list-recipes"],
  { tags: [TAG_PRODUCTS], revalidate: TTL },
);

export const listMediaByProductCached = unstable_cache(
  async (id: number) => listMediaByProduct(id),
  ["list-media"],
  { tags: [TAG_PRODUCTS], revalidate: TTL },
);

/**
 * Сбросить кеш после изменения каталога. Вызывать из всех путей записи:
 * админских роутов и Telegram-вебхука.
 *
 * Тег `product:<id>` пока никто не читает отдельно, но он делает вызовы
 * самодокументируемыми и пригодится, если кеш станет точечным.
 */
export function revalidateProducts(productId?: number): void {
  // { expire: 0 } — сбросить немедленно. Профиль "max" отдал бы устаревшую
  // страницу ещё один раз, и Лена после правки увидела бы старый вариант.
  // Односоставная форма revalidateTag(tag) в Next 16 объявлена устаревшей.
  revalidateTag(TAG_PRODUCTS, { expire: 0 });
  if (productId !== undefined) {
    revalidateTag(productTag(productId), { expire: 0 });
  }
}
