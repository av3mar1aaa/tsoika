import Link from "next/link";
import Image from "next/image";
import { listProducts } from "@/lib/products";
import DeleteProductButton from "@/components/admin/DeleteProductButton";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const products = await listProducts();

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-semibold text-rose-800">
        Десерты
      </h1>

      {products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-rose-200 bg-white p-12 text-center">
          <p className="mb-4 text-rose-800/70">Пока нет ни одного десерта.</p>
          <Link
            href="/admin/products/new"
            className="inline-block rounded-lg bg-rose-400 px-4 py-2 text-sm font-medium text-white hover:bg-rose-600"
          >
            Добавить первый
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-rose-200 bg-white shadow-sm">
          <table className="w-full">
            <thead className="bg-rose-100 text-left text-sm text-rose-800">
              <tr>
                <th className="w-20 px-4 py-3">Фото</th>
                <th className="px-4 py-3">Название</th>
                <th className="w-52 px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr
                  key={p.id}
                  className="border-t border-rose-100 text-sm text-rose-900"
                >
                  <td className="px-4 py-3">
                    <div className="relative h-14 w-14 overflow-hidden rounded-lg bg-rose-100">
                      <Image
                        src={p.image_path}
                        alt={p.name}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/products/${p.id}/edit`}
                      className="font-medium text-rose-800 hover:text-rose-600"
                    >
                      {p.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/products/${p.id}/edit`}
                      className="mr-2 inline-block rounded-lg border border-rose-200 px-3 py-1 text-xs text-rose-800 hover:bg-rose-100"
                    >
                      Редактировать
                    </Link>
                    <DeleteProductButton id={p.id} name={p.name} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
