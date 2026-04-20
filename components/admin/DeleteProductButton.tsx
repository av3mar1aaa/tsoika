"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteProductButton({
  id,
  name,
}: {
  id: number;
  name: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onClick() {
    if (!confirm(`Удалить десерт "${name}" вместе со всеми рецептами?`)) {
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Не удалось удалить");
        return;
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="inline-block rounded-lg border border-rose-200 px-3 py-1 text-xs text-rose-800 hover:bg-rose-100 disabled:opacity-50"
    >
      {loading ? "…" : "Удалить"}
    </button>
  );
}
