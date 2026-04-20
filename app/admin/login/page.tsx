"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const from = params.get("from") || "/admin";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Ошибка входа");
        return;
      }
      router.push(from);
      router.refresh();
    } catch {
      setError("Ошибка сети");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-2xl border border-rose-200 bg-white p-8 shadow-sm"
      >
        <h1 className="mb-6 text-center text-2xl font-semibold text-rose-800">
          Вход в админ-панель
        </h1>

        <label className="mb-4 block">
          <span className="mb-1 block text-sm text-rose-800">Логин</span>
          <input
            type="text"
            required
            autoFocus
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 outline-none focus:border-rose-400"
          />
        </label>

        <label className="mb-6 block">
          <span className="mb-1 block text-sm text-rose-800">Пароль</span>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 outline-none focus:border-rose-400"
          />
        </label>

        {error && (
          <p className="mb-4 rounded-lg bg-rose-100 px-3 py-2 text-sm text-rose-800">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-rose-400 py-2 font-medium text-white transition-colors hover:bg-rose-600 disabled:opacity-60"
        >
          {loading ? "Входим…" : "Войти"}
        </button>
      </form>
    </div>
  );
}
