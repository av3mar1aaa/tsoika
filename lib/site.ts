/**
 * Публичный адрес сайта — sitemap, robots, OG-теги.
 *
 * Используется только на сервере, поэтому читается в рантайме: менять адрес
 * можно перезапуском сервиса, без пересборки. У `NEXT_PUBLIC_SITE_URL`
 * значение впекается в бандл во время `next build` — она поддержана как
 * запасной вариант, но на проде задавайте `SITE_URL`.
 */
const configured =
  process.env.SITE_URL?.trim() || process.env.NEXT_PUBLIC_SITE_URL?.trim();

export const SITE_URL = (configured || "http://localhost:3000").replace(
  /\/$/,
  "",
);
