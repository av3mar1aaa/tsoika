import Link from "next/link";
import { countProducts, listProducts } from "@/lib/products";
import { isValidCategory } from "@/lib/categories";
import ProductGrid from "@/components/ProductGrid";
import CategoryTabs from "@/components/CategoryTabs";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 24;

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string }>;
}) {
  const sp = await searchParams;
  const pageNum = Math.max(1, Number(sp.page) || 1);
  const categoryParam =
    sp.category && isValidCategory(sp.category) ? sp.category : null;

  const [total, products] = await Promise.all([
    countProducts({ category: categoryParam }),
    listProducts({
      limit: PAGE_SIZE,
      offset: (pageNum - 1) * PAGE_SIZE,
      category: categoryParam,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasPrev = pageNum > 1;
  const hasNext = pageNum < totalPages;

  const baseQuery = categoryParam
    ? `&category=${encodeURIComponent(categoryParam)}`
    : "";

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="font-display text-3xl font-semibold text-rose-800">
          {categoryParam ?? "Каталог"}
        </h1>
        <p className="text-rose-900/70">Всего: {total}</p>
      </div>

      <div className="mb-8">
        <CategoryTabs active={categoryParam} />
      </div>

      <ProductGrid products={products} />

      {totalPages > 1 && (
        <nav
          aria-label="Pagination"
          className="mt-10 flex items-center justify-center gap-2"
        >
          {hasPrev ? (
            <Link
              href={`/catalog?page=${pageNum - 1}${baseQuery}`}
              className="rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-sm text-rose-800 hover:bg-rose-100"
            >
              ← Назад
            </Link>
          ) : (
            <span className="rounded-lg border border-rose-100 bg-rose-50 px-3 py-1.5 text-sm text-rose-300">
              ← Назад
            </span>
          )}
          <span className="px-3 py-1.5 text-sm text-rose-800/70">
            {pageNum} / {totalPages}
          </span>
          {hasNext ? (
            <Link
              href={`/catalog?page=${pageNum + 1}${baseQuery}`}
              className="rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-sm text-rose-800 hover:bg-rose-100"
            >
              Вперёд →
            </Link>
          ) : (
            <span className="rounded-lg border border-rose-100 bg-rose-50 px-3 py-1.5 text-sm text-rose-300">
              Вперёд →
            </span>
          )}
        </nav>
      )}
    </div>
  );
}
