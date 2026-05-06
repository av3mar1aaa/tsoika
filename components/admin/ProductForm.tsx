"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  mode: "create" | "edit";
  initial?: {
    id: number;
    name: string;
    description: string | null;
    image_path: string;
    show_order_button: boolean;
  };
};

export default function ProductForm({ mode, initial }: Props) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [showOrderButton, setShowOrderButton] = useState(
    initial?.show_order_button ?? false,
  );
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(
    initial?.image_path ?? null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (mode === "create" && !file) {
      setError("Загрузите фото");
      return;
    }

    const form = new FormData();
    form.set("name", name);
    form.set("description", description);
    form.set("show_order_button", showOrderButton ? "1" : "0");
    if (file) form.set("image", file);

    setLoading(true);
    try {
      const url =
        mode === "create"
          ? "/api/admin/products"
          : `/api/admin/products/${initial!.id}`;
      const res = await fetch(url, {
        method: mode === "create" ? "POST" : "PUT",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Ошибка сохранения");
        return;
      }
      if (mode === "create") {
        router.push(`/admin/products/${data.product.id}/edit`);
      } else {
        router.refresh();
      }
    } catch {
      setError("Ошибка сети");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-rose-200 bg-white p-6 shadow-sm"
    >
      <div className="grid gap-6 md:grid-cols-[220px_1fr]">
        <div>
          <div className="relative mb-2 aspect-square w-full overflow-hidden rounded-xl bg-rose-100">
            {preview ? (
              <Image
                src={preview}
                alt="Превью"
                fill
                sizes="220px"
                className="object-cover"
                unoptimized={preview.startsWith("blob:")}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-rose-800/60">
                Нет фото
              </div>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={onFileChange}
            className="block w-full text-xs text-rose-800 file:mr-2 file:rounded-md file:border-0 file:bg-rose-100 file:px-3 file:py-1.5 file:text-xs file:text-rose-800 hover:file:bg-rose-200"
          />
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm text-rose-800">Название</span>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 outline-none focus:border-rose-400"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm text-rose-800">
              Описание (необязательно)
            </span>
            <textarea
              value={description ?? ""}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 outline-none focus:border-rose-400"
            />
          </label>

          <label className="flex cursor-pointer items-center gap-2 select-none">
            <input
              type="checkbox"
              checked={showOrderButton}
              onChange={(e) => setShowOrderButton(e.target.checked)}
              className="h-4 w-4 accent-rose-400"
            />
            <span className="text-sm text-rose-800">
              Показывать кнопку «Заказать»
            </span>
          </label>

          {error && (
            <p className="rounded-lg bg-rose-100 px-3 py-2 text-sm text-rose-800">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-rose-400 px-4 py-2 text-sm font-medium text-white hover:bg-rose-600 disabled:opacity-60"
          >
            {loading
              ? "Сохраняем…"
              : mode === "create"
                ? "Создать"
                : "Сохранить"}
          </button>
        </div>
      </div>
    </form>
  );
}
