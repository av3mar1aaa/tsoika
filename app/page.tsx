import Hero from "@/components/Hero";
import Welcome from "@/components/Welcome";
import PhotoStrip from "@/components/PhotoStrip";
import { listProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function Home() {
  const products = await listProducts({ limit: 30 });

  return (
    <>
      <Hero />
      <Welcome />
      {products.length > 0 && (
        <section className="mx-auto max-w-7xl pb-20">
          <h2 className="mb-6 px-6 text-center font-display text-3xl font-semibold text-rose-800">
            Из моей кухни
          </h2>
          <PhotoStrip products={products} />
        </section>
      )}
    </>
  );
}
