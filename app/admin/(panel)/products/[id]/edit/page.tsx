import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct } from "@/lib/products";
import { listRecipesByProduct } from "@/lib/recipes";
import { listMediaByProduct } from "@/lib/media";
import ProductForm from "@/components/admin/ProductForm";
import RecipeEditor from "@/components/admin/RecipeEditor";
import MediaManager from "@/components/admin/MediaManager";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
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
    <div className="space-y-10">
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h1 className="font-display text-2xl font-semibold text-rose-800">
            Редактировать: {product.name}
          </h1>
          <Link
            href={`/products/${product.id}`}
            className="text-sm text-rose-800/70 hover:text-rose-600"
          >
            Посмотреть на сайте →
          </Link>
        </div>
        <ProductForm mode="edit" initial={product} />
      </div>

      <section>
        <h2 className="mb-4 font-display text-xl font-semibold text-rose-800">
          Галерея ({media.length})
        </h2>
        <MediaManager productId={productId} media={media} />
      </section>

      <section>
        <h2 className="mb-4 font-display text-xl font-semibold text-rose-800">
          Рецепты ({recipes.length})
        </h2>
        <RecipeEditor productId={productId} recipes={recipes} />
      </section>
    </div>
  );
}
