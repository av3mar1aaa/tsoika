"use client";

import { useState } from "react";
import Link from "next/link";
import { CATEGORY_GROUPS } from "@/lib/categories";

export default function CategoryTabs({
  active,
}: {
  active: string | null;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const currentLabel = active ?? "Все товары";
  const menuId = "category-menu";

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <CategoryLink
          label={currentLabel}
          value={active}
          active={active}
          strong
        />
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls={menuId}
          aria-label={menuOpen ? "Свернуть разделы" : "Показать все разделы"}
          className="flex h-9 items-center justify-center rounded-lg border border-rose-200 bg-white px-4 text-sm font-medium text-rose-800 shadow-sm transition-colors hover:bg-rose-100"
        >
          {menuOpen ? "Свернуть" : "Разделы"}
        </button>
      </div>

      {menuOpen && (
        <div
          id={menuId}
          className="grid items-start gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          <div>
            <div className="rounded-xl border border-rose-200 bg-white p-3 shadow-sm">
              <CategoryLink
                label="Все товары"
                value={null}
                active={active}
                strong
              />
            </div>
          </div>

          {CATEGORY_GROUPS.map((group) => (
            <div key={group.name}>
              <div className="grid gap-2 rounded-xl border border-rose-200 bg-white p-3 shadow-sm">
                <CategoryLink
                  label={group.name}
                  value={group.name}
                  active={active}
                  strong
                />
                {"children" in group ? (
                  <div className="grid gap-2">
                    {group.children.map((child) => (
                      <CategoryLink
                        key={child}
                        label={child}
                        value={child}
                        active={active}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CategoryLink({
  label,
  value,
  active,
  strong = false,
}: {
  label: string;
  value: string | null;
  active: string | null;
  strong?: boolean;
}) {
  const isActive = (active == null && value == null) || active === value;
  const href =
    value == null ? "/catalog" : `/catalog?category=${encodeURIComponent(value)}`;

  return (
    <Link
      href={href}
      className={`flex min-h-9 w-full items-center justify-center rounded-lg border px-3 py-1.5 text-center text-sm leading-tight transition-colors ${
        strong ? "font-medium" : ""
      } ${
        isActive
          ? "border-rose-400 bg-rose-400 text-white"
          : "border-rose-200 bg-white text-rose-800 hover:bg-rose-100"
      }`}
    >
      {label}
    </Link>
  );
}
