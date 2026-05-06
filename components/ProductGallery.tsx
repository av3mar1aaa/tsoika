"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import type { ProductMedia } from "@/lib/media";

export default function ProductGallery({ media }: { media: ProductMedia[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const close = useCallback(() => setOpenIndex(null), []);
  const next = useCallback(
    () =>
      setOpenIndex((i) => (i == null ? null : (i + 1) % media.length)),
    [media.length],
  );
  const prev = useCallback(
    () =>
      setOpenIndex((i) =>
        i == null ? null : (i - 1 + media.length) % media.length,
      ),
    [media.length],
  );

  useEffect(() => {
    if (openIndex == null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [openIndex, close, next, prev]);

  if (media.length === 0) return null;

  const current = openIndex != null ? media[openIndex] : null;

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {media.map((m, i) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setOpenIndex(i)}
            className="group relative block aspect-square overflow-hidden rounded-xl border border-rose-200 bg-rose-100 text-left"
          >
            {m.kind === "image" ? (
              <Image
                src={m.url}
                alt=""
                fill
                sizes="(max-width: 640px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <>
                <video
                  src={m.url}
                  muted
                  playsInline
                  preload="metadata"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="rounded-full bg-black/50 p-3">
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="white"
                      aria-hidden="true"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                </span>
              </>
            )}
          </button>
        ))}
      </div>

      {current && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={close}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm"
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              close();
            }}
            aria-label="Закрыть"
            className="absolute right-4 top-4 rounded-full bg-white/15 p-2 text-white hover:bg-white/30"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.3 5.71 12 12l6.3 6.29-1.42 1.42L10.59 13.4 4.3 19.71 2.88 18.3 9.17 12 2.88 5.71 4.3 4.29l6.29 6.3 6.3-6.3z" />
            </svg>
          </button>

          {media.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                aria-label="Предыдущее"
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/15 p-3 text-white hover:bg-white/30"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.7 5.7 14.3 4.3 6.6 12l7.7 7.7 1.4-1.4L9.4 12z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                aria-label="Следующее"
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/15 p-3 text-white hover:bg-white/30"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8.3 18.3 9.7 19.7 17.4 12 9.7 4.3 8.3 5.7 14.6 12z" />
                </svg>
              </button>
            </>
          )}

          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[90vh] max-w-[92vw]"
          >
            {current.kind === "image" ? (
              <Image
                src={current.url}
                alt=""
                width={1600}
                height={1600}
                className="max-h-[90vh] w-auto rounded-lg object-contain"
                sizes="92vw"
                priority
              />
            ) : (
              <video
                src={current.url}
                controls
                autoPlay
                playsInline
                className="max-h-[90vh] w-auto rounded-lg"
              />
            )}
          </div>

          {media.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/40 px-3 py-1 text-xs text-white">
              {(openIndex ?? 0) + 1} / {media.length}
            </div>
          )}
        </div>
      )}
    </>
  );
}
