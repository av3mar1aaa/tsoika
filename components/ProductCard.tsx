import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/products";
import OrderButton from "./OrderButton";

export default function ProductCard({ product }: { product: Product }) {
  const w = product.image_width ?? 1;
  const h = product.image_height ?? 1;

  return (
    <div className="group mb-4 break-inside-avoid overflow-hidden rounded-2xl border border-rose-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <Link href={`/products/${product.id}`} className="block">
        <div
          className="relative w-full overflow-hidden bg-rose-100"
          style={{ aspectRatio: `${w} / ${h}` }}
        >
          <Image
            src={product.image_path}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
        </div>
        <div className="px-4 py-4">
          <h3 className="font-display text-lg text-rose-800">{product.name}</h3>
          {product.description && (
            <p className="mt-1 line-clamp-2 text-sm text-rose-900/70">
              {product.description}
            </p>
          )}
        </div>
      </Link>
      {product.show_order_button && (
        <div className="px-4 pb-4 -mt-2">
          <OrderButton productName={product.name} className="w-full" />
        </div>
      )}
    </div>
  );
}
