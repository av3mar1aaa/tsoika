"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { GalleryPhoto } from "@/lib/gallery";

export default function GalleryManager({
  photos,
}: {
  photos: GalleryPhoto[];
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
      xhr.open("POST", "/api/admin/gallery");
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setProgress({ name: file.name, pct: (e.loaded / e.total) * 100 });
        }
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) resolve();
        else {
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
    if (!confirm("Удалить фото из ленты?")) return;
    const res = await fetch(`/api/admin/gallery/${id}`, { method: "DELETE" });
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
            accept="image/*"
            multiple
            onChange={onFiles}
            disabled={uploading}
            className="hidden"
          />
          {uploading ? "Загрузка…" : "+ Добавить фото в ленту"}
        </label>
        <span className="text-xs text-rose-800/60">
          Можно выбрать несколько. Фото попадают в ленту на главной странице.
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

      {photos.length === 0 ? (
        <div className="rounded-xl border border-dashed border-rose-200 bg-white p-8 text-center text-sm text-rose-800/60">
          Лента пуста — загрузите первое фото
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {photos.map((p) => (
            <div
              key={p.id}
              className="overflow-hidden rounded-xl border border-rose-200 bg-white"
            >
              <div className="relative aspect-square w-full bg-rose-100">
                <Image
                  src={p.url}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-cover"
                />
              </div>
              <button
                onClick={() => remove(p.id)}
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
