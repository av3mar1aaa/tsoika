import Image from "next/image";
import { notFound } from "next/navigation";
import { getProduct } from "@/lib/products";
import { listRecipesByProduct } from "@/lib/recipes";
import { listMediaByProduct } from "@/lib/media";
import OrderButton from "@/components/OrderButton";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const productId = Number(id);
  if (!Number.isInteger(productId)) notFound();

  const product = await getProduct(productId);
  if (!product) notFound();

  const [recipes, media] = await Promise.all([
    listRecipesByProduct(productId),
    listMediaByProduct(productId),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <article className="overflow-hidden rounded-2xl border border-rose-200 bg-white shadow-sm">
        <div className="relative aspect-[16/10] w-full bg-rose-100">
          <Image
            src={product.image_path}
            alt={product.name}
            fill
            sizes="(max-width: 1024px) 100vw, 900px"
            priority
            className="object-cover"
          />
        </div>
        <div className="p-8">
          <h1 className="font-display text-4xl font-semibold text-rose-800">
            {product.name}
          </h1>
          {product.description && (
            <p className="mt-4 text-rose-900/80 whitespace-pre-line">
              {product.description}
            </p>
          )}
          {product.show_order_button && (
            <div className="mt-6">
              <OrderButton productName={product.name} size="lg" />
            </div>
          )}
        </div>
      </article>

      {media.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-6 font-display text-2xl font-semibold text-rose-800">
            Галерея
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {media.map((m) =>
              m.kind === "image" ? (
                <a
                  key={m.id}
                  href={m.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative block aspect-square overflow-hidden rounded-xl border border-rose-200 bg-rose-100"
                >
                  <Image
                    src={m.url}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 50vw, 33vw"
                    className="object-cover transition-transform hover:scale-105"
                  />
                </a>
              ) : (
                <video
                  key={m.id}
                  src={m.url}
                  controls
                  playsInline
                  preload="metadata"
                  className="aspect-square w-full overflow-hidden rounded-xl border border-rose-200 bg-black object-cover"
                />
              ),
            )}
          </div>
        </section>
      )}

      <section className="mt-12">
        <h2 className="mb-6 font-display text-2xl font-semibold text-rose-800">
          Рецепты
        </h2>

        {recipes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-rose-200 bg-white p-8 text-center text-rose-800/70">
            Пока нет рецептов для этого десерта.
          </div>
        ) : (
          <div className="space-y-6">
            {recipes.map((r) => {
              const hasIngredients = r.ingredients.trim().length > 0;
              return (
                <div
                  key={r.id}
                  className="rounded-2xl border border-rose-200 bg-white p-6 shadow-sm"
                >
                  <h3 className="font-display text-xl font-semibold text-rose-800">
                    {r.title}
                  </h3>
                  {hasIngredients ? (
                    <div className="mt-4 grid gap-6 md:grid-cols-[1fr_2fr]">
                      <div>
                        <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-rose-600">
                          Ингредиенты
                        </h4>
                        <p className="whitespace-pre-line text-sm text-rose-900/80">
                          {r.ingredients}
                        </p>
                      </div>
                      <div>
                        <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-rose-600">
                          Приготовление
                        </h4>
                        <p className="whitespace-pre-line text-sm text-rose-900/80">
                          {r.instructions}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-4 whitespace-pre-line text-sm text-rose-900/80">
                      {r.instructions}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
