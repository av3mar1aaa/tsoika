"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import Image from "next/image";
import type { ProductMedia } from "@/lib/media";

export default function MediaManager({
  productId,
  media,
}: {
  productId: number;
  media: ProductMedia[];
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<{ name: string; pct: number } | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  async function uploadOne(file: File): Promise<void> {
    setProgress({ name: file.name, pct: 0 });
    const form = new FormData();
    form.set("file", file);

    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `/api/admin/products/${productId}/media`);
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setProgress({ name: file.name, pct: (e.loaded / e.total) * 100 });
        }
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          try {
            const data = JSON.parse(xhr.responseText);
            reject(new Error(data.error || `HTTP ${xhr.status}`));
          } catch {
            reject(new Error(`HTTP ${xhr.status}`));
          }
        }
      };
      xhr.onerror = () => reject(new Error("Ошибка сети"));
      xhr.send(form);
    });
  }

  async function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setError(null);
    setUploading(true);
    try {
      for (const f of files) {
        await uploadOne(f);
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setUploading(false);
      setProgress(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function remove(id: number) {
    if (!confirm("Удалить этот файл?")) return;
    const res = await fetch(`/api/admin/media/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "Не удалось удалить");
      return;
    }
    router.refresh();
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="inline-flex cursor-pointer items-center rounded-lg bg-rose-400 px-4 py-2 text-sm font-medium text-white hover:bg-rose-600">
          <input
            ref={fileRef}
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={onFiles}
            disabled={uploading}
            className="hidden"
          />
          {uploading ? "Загрузка…" : "+ Добавить фото / видео"}
        </label>
        <span className="text-xs text-rose-800/60">
          Можно выбрать несколько. Видео: до 200 МБ, MP4/WebM/MOV.
        </span>
      </div>

      {progress && (
        <div className="mb-3 rounded-lg border border-rose-200 bg-white p-3 text-sm text-rose-800">
          <div className="mb-1 flex justify-between">
            <span className="truncate">{progress.name}</span>
            <span>{progress.pct.toFixed(0)}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-rose-100">
            <div
              className="h-full bg-rose-400 transition-all"
              style={{ width: `${progress.pct}%` }}
            />
          </div>
        </div>
      )}

      {error && (
        <p className="mb-3 rounded-lg bg-rose-100 px-3 py-2 text-sm text-rose-800">
          {error}
        </p>
      )}

      {media.length === 0 ? (
        <div className="rounded-xl border border-dashed border-rose-200 bg-white p-8 text-center text-sm text-rose-800/60">
          Галерея пуста
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {media.map((m) => (
            <div
              key={m.id}
              className="group relative overflow-hidden rounded-xl border border-rose-200 bg-white"
            >
              <div className="relative aspect-square w-full bg-rose-100">
                {m.kind === "image" ? (
                  <Image
                    src={m.url}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 50vw, 25vw"
                    className="object-cover"
                  />
                ) : (
                  <video
                    src={m.url}
                    muted
                    playsInline
                    preload="metadata"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                )}
                <span className="absolute left-2 top-2 rounded-md bg-black/50 px-2 py-0.5 text-[10px] uppercase text-white">
                  {m.kind === "image" ? "фото" : "видео"}
                </span>
              </div>
              <button
                onClick={() => remove(m.id)}
                className="block w-full border-t border-rose-100 py-1.5 text-xs text-rose-800 hover:bg-rose-100"
              >
                Удалить
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
