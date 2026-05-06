"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/products";

export default function PhotoStrip({ products }: { products: Product[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      setCanPrev(el.scrollLeft > 4);
      setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [products.length]);

  function scrollBy(direction: 1 | -1) {
    const el = ref.current;
    if (!el) return;
    const delta = el.clientWidth * 0.8 * direction;
    el.scrollBy({ left: delta, behavior: "smooth" });
  }

  if (products.length === 0) return null;

  return (
    <div className="relative">
      <div
        ref={ref}
        className="scrollbar-none flex snap-x gap-4 overflow-x-auto px-6 pb-4 sm:gap-5"
        style={{ scrollbarWidth: "none" }}
      >
        {products.map((p) => {
          const w = p.image_width ?? 1;
          const h = p.image_height ?? 1;
          return (
            <Link
              key={p.id}
              href={`/products/${p.id}`}
              className="group relative h-56 flex-shrink-0 snap-start overflow-hidden rounded-2xl border border-rose-200 bg-rose-100 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:h-72"
              style={{
                aspectRatio: `${w} / ${h}`,
              }}
            >
              <Image
                src={p.image_path}
                alt={p.name}
                fill
                sizes="(max-width: 640px) 60vw, 320px"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                <span className="block truncate text-sm font-medium text-white drop-shadow-sm">
                  {p.name}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => scrollBy(-1)}
        aria-label="Назад"
        disabled={!canPrev}
        className="absolute left-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/90 p-2 text-rose-800 shadow-sm ring-1 ring-rose-200 transition hover:bg-white disabled:cursor-default disabled:opacity-0 sm:block"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M15.7 5.7 14.3 4.3 6.6 12l7.7 7.7 1.4-1.4L9.4 12z" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => scrollBy(1)}
        aria-label="Вперёд"
        disabled={!canNext}
        className="absolute right-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/90 p-2 text-rose-800 shadow-sm ring-1 ring-rose-200 transition hover:bg-white disabled:cursor-default disabled:opacity-0 sm:block"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8.3 18.3 9.7 19.7 17.4 12 9.7 4.3 8.3 5.7 14.6 12z" />
        </svg>
      </button>
    </div>
  );
}
