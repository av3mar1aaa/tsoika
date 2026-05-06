import Link from "next/link";
import { countProducts, listProducts } from "@/lib/products";
import ProductGrid from "@/components/ProductGrid";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 24;

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const sp = await searchParams;
  const pageNum = Math.max(1, Number(sp.page) || 1);

  const [total, products] = await Promise.all([
    countProducts(),
    listProducts({ limit: PAGE_SIZE, offset: (pageNum - 1) * PAGE_SIZE }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasPrev = pageNum > 1;
  const hasNext = pageNum < totalPages;

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-8 flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="font-display text-3xl font-semibold text-rose-800">
          Каталог
        </h1>
        <p className="text-rose-900/70">
          Всего десертов: {total}
        </p>
      </div>

      <ProductGrid products={products} />

      {totalPages > 1 && (
        <nav
          aria-label="Pagination"
          className="mt-10 flex items-center justify-center gap-2"
        >
          {hasPrev ? (
            <Link
              href={`/catalog?page=${pageNum - 1}`}
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
              href={`/catalog?page=${pageNum + 1}`}
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
