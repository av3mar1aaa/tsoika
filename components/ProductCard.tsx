import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/products";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="group block overflow-hidden rounded-2xl border border-rose-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-rose-100">
        <Image
          src={product.image_path}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        <h3 className="font-display text-lg text-rose-800">{product.name}</h3>
        {product.description && (
          <p className="mt-1 line-clamp-2 text-sm text-rose-900/70">
            {product.description}
          </p>
        )}
      </div>
    </Link>
  );
}
