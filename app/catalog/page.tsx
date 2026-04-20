import { listProducts } from "@/lib/products";
import ProductGrid from "@/components/ProductGrid";

export const dynamic = "force-dynamic";

export default async function CatalogPage() {
  const products = await listProducts();

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="mb-8 font-display text-3xl font-semibold text-rose-800">
        Каталог
      </h1>
      <p className="mb-8 text-rose-900/70">
        Всего десертов: {products.length}
      </p>
      <ProductGrid products={products} />
    </div>
  );
}
