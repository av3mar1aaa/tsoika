import ProductForm from "@/components/admin/ProductForm";

export default function NewProductPage() {
  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-semibold text-rose-800">
        Новый десерт
      </h1>
      <ProductForm mode="create" />
    </div>
  );
}
