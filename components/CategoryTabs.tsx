import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";

export default function CategoryTabs({
  active,
}: {
  active: string | null;
}) {
  const tabs: Array<{ label: string; value: string | null }> = [
    { label: "Все товары", value: null },
    ...CATEGORIES.map((c) => ({ label: c, value: c })),
  ];

  return (
    <div className="scrollbar-none -mx-6 flex gap-2 overflow-x-auto px-6 pb-3">
      {tabs.map((tab) => {
        const isActive =
          (active == null && tab.value == null) || active === tab.value;
        const href =
          tab.value == null
            ? "/catalog"
            : `/catalog?category=${encodeURIComponent(tab.value)}`;
        return (
          <Link
            key={tab.label}
            href={href}
            className={`flex-shrink-0 rounded-full border px-4 py-1.5 text-sm transition-colors ${
              isActive
                ? "border-rose-400 bg-rose-400 text-white"
                : "border-rose-200 bg-white text-rose-800 hover:bg-rose-100"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
