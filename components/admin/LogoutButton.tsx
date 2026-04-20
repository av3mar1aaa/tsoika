"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onClick() {
    setLoading(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-sm text-rose-800 transition hover:bg-rose-100"
    >
      {loading ? "…" : "Выйти"}
    </button>
  );
}
