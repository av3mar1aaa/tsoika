import ProductCard from "./ProductCard";
import type { Product } from "@/lib/products";

export default function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-rose-200 bg-white p-12 text-center text-rose-800/70">
        Пока нет десертов. Загляните позже!
      </div>
    );
  }
  return (
    <div className="columns-2 gap-4 sm:columns-3 lg:columns-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
