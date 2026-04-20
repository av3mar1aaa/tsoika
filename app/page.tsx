import { listProducts } from "@/lib/products";
import ProductGrid from "@/components/ProductGrid";

export const dynamic = "force-dynamic";

export default async function Home() {
  const products = await listProducts();

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <section className="mb-12 text-center">
        <h1 className="font-display text-4xl font-semibold text-rose-800 sm:text-5xl">
          Домашние десерты
        </h1>
        <p className="mt-3 text-rose-900/70">
          Нежные пирожные, торты и сладости — с любовью и по авторским рецептам.
        </p>
      </section>

      <ProductGrid products={products.slice(0, 8)} />
    </div>
  );
}
