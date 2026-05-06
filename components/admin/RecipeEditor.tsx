"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Recipe } from "@/lib/recipes";
import RichTextEditor from "./RichTextEditor";

type Props = {
  productId: number;
  recipes: Recipe[];
};

export default function RecipeEditor({ productId, recipes }: Props) {
  return (
    <div className="space-y-4">
      {recipes.map((r) => (
        <RecipeItem key={r.id} recipe={r} />
      ))}
      <NewRecipeForm productId={productId} />
    </div>
  );
}

function RecipeItem({ recipe }: { recipe: Recipe }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(recipe.title);
  const [ingredients, setIngredients] = useState(recipe.ingredients);
  const [instructions, setInstructions] = useState(recipe.instructions);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/recipes/${recipe.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, ingredients, instructions }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Ошибка");
        return;
      }
      setEditing(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function remove() {
    if (!confirm(`Удалить рецепт "${recipe.title}"?`)) return;
    setLoading(true);
    try {
      await fetch(`/api/admin/recipes/${recipe.id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (!editing) {
    return (
      <div className="rounded-xl border border-rose-200 bg-white p-4">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-display text-lg text-rose-800">{recipe.title}</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setEditing(true)}
              className="rounded-md border border-rose-200 px-2 py-1 text-xs text-rose-800 hover:bg-rose-100"
            >
              Изменить
            </button>
            <button
              onClick={remove}
              disabled={loading}
              className="rounded-md border border-rose-200 px-2 py-1 text-xs text-rose-800 hover:bg-rose-100 disabled:opacity-50"
            >
              Удалить
            </button>
          </div>
        </div>
        <div className="mt-2 grid gap-4 text-sm text-rose-900/80 md:grid-cols-2">
          <div>
            <div className="text-xs font-semibold uppercase text-rose-600">
              Ингредиенты
            </div>
            <p className="whitespace-pre-line">{recipe.ingredients}</p>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase text-rose-600">
              Приготовление
            </div>
            <p className="whitespace-pre-line">{recipe.instructions}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-rose-200 bg-white p-4">
      <RecipeFields
        title={title}
        ingredients={ingredients}
        instructions={instructions}
        onChange={(field, v) => {
          if (field === "title") setTitle(v);
          if (field === "ingredients") setIngredients(v);
          if (field === "instructions") setInstructions(v);
        }}
      />
      {error && (
        <p className="mt-2 rounded-lg bg-rose-100 px-3 py-2 text-sm text-rose-800">
          {error}
        </p>
      )}
      <div className="mt-3 flex gap-2">
        <button
          onClick={save}
          disabled={loading}
          className="rounded-lg bg-rose-400 px-3 py-1.5 text-sm font-medium text-white hover:bg-rose-600 disabled:opacity-60"
        >
          Сохранить
        </button>
        <button
          onClick={() => {
            setEditing(false);
            setTitle(recipe.title);
            setIngredients(recipe.ingredients);
            setInstructions(recipe.instructions);
          }}
          className="rounded-lg border border-rose-200 px-3 py-1.5 text-sm text-rose-800 hover:bg-rose-100"
        >
          Отмена
        </button>
      </div>
    </div>
  );
}

function NewRecipeForm({ productId }: { productId: number }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [instructions, setInstructions] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/products/${productId}/recipes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, ingredients, instructions }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Ошибка");
        return;
      }
      setTitle("");
      setIngredients("");
      setInstructions("");
      setOpen(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-xl border border-dashed border-rose-300 bg-white px-4 py-3 text-sm text-rose-800 hover:bg-rose-100"
      >
        + Добавить рецепт
      </button>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-xl border border-rose-200 bg-white p-4"
    >
      <RecipeFields
        title={title}
        ingredients={ingredients}
        instructions={instructions}
        onChange={(field, v) => {
          if (field === "title") setTitle(v);
          if (field === "ingredients") setIngredients(v);
          if (field === "instructions") setInstructions(v);
        }}
      />
      {error && (
        <p className="mt-2 rounded-lg bg-rose-100 px-3 py-2 text-sm text-rose-800">
          {error}
        </p>
      )}
      <div className="mt-3 flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-rose-400 px-3 py-1.5 text-sm font-medium text-white hover:bg-rose-600 disabled:opacity-60"
        >
          {loading ? "Добавляем…" : "Добавить"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg border border-rose-200 px-3 py-1.5 text-sm text-rose-800 hover:bg-rose-100"
        >
          Отмена
        </button>
      </div>
    </form>
  );
}

function RecipeFields({
  title,
  ingredients,
  instructions,
  onChange,
}: {
  title: string;
  ingredients: string;
  instructions: string;
  onChange: (
    field: "title" | "ingredients" | "instructions",
    value: string,
  ) => void;
}) {
  return (
    <div className="space-y-4">
      <label className="block">
        <span className="mb-1 block text-xs font-semibold uppercase text-rose-600">
          Название рецепта
        </span>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => onChange("title", e.target.value)}
          className="w-full rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 outline-none focus:border-rose-400"
        />
      </label>
      <div>
        <span className="mb-1 block text-xs font-semibold uppercase text-rose-600">
          Ингредиенты (необязательно)
        </span>
        <RichTextEditor
          value={ingredients}
          onChange={(v) => onChange("ingredients", v)}
          minRows={4}
          placeholder="по строке на ингредиент — можно оставить пустым"
        />
      </div>
      <div>
        <span className="mb-1 block text-xs font-semibold uppercase text-rose-600">
          Текст рецепта
        </span>
        <RichTextEditor
          value={instructions}
          onChange={(v) => onChange("instructions", v)}
          minRows={8}
        />
        <p className="mt-1 text-xs text-rose-800/60">
          Выделите текст и нажмите B / I / H1-H3 / список — форматирование
          применится сразу.
        </p>
      </div>
    </div>
  );
}
