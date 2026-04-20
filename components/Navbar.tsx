import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-rose-200 bg-rose-50/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="font-display text-2xl font-semibold tracking-tight text-rose-800"
        >
          Цойка
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link
            href="/"
            className="text-rose-800 transition-colors hover:text-rose-600"
          >
            Главная
          </Link>
          <Link
            href="/catalog"
            className="text-rose-800 transition-colors hover:text-rose-600"
          >
            Каталог
          </Link>
        </nav>
      </div>
    </header>
  );
}
