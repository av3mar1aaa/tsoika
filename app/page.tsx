import { listProducts } from "@/lib/products";
import ProductGrid from "@/components/ProductGrid";
import Hero from "@/components/Hero";

export const dynamic = "force-dynamic";

export default async function Home() {
  const products = await listProducts();

  return (
    <>
      <Hero />

      <div className="mx-auto max-w-6xl px-6 py-12">
        <h2 className="mb-8 text-center font-display text-3xl font-semibold text-rose-800">
          Наши десерты
        </h2>
        <ProductGrid products={products.slice(0, 8)} />
      </div>
    </>
  );
}
