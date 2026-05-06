import Link from "next/link";
import LogoutButton from "@/components/admin/LogoutButton";

export default function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-rose-200 pb-4">
        <div className="flex items-center gap-6">
          <Link
            href="/admin"
            className="font-display text-xl font-semibold text-rose-800"
          >
            Админ-панель
          </Link>
          <Link
            href="/admin/products/new"
            className="text-sm text-rose-800 hover:text-rose-600"
          >
            + Новый десерт
          </Link>
          <Link
            href="/admin/gallery"
            className="text-sm text-rose-800 hover:text-rose-600"
          >
            Лента
          </Link>
          <Link
            href="/"
            className="text-sm text-rose-800/70 hover:text-rose-600"
          >
            На сайт
          </Link>
        </div>
        <LogoutButton />
      </div>
      {children}
    </div>
  );
}
