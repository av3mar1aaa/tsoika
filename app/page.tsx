import Hero from "@/components/Hero";
import Welcome from "@/components/Welcome";
import PhotoStrip from "@/components/PhotoStrip";
import { listGalleryPhotos } from "@/lib/gallery";

export const dynamic = "force-dynamic";

export default async function Home() {
  const photos = await listGalleryPhotos();

  return (
    <>
      <Hero />
      <Welcome />
      {photos.length > 0 && (
        <section className="mx-auto max-w-7xl pb-20">
          <h2 className="mb-6 px-6 text-center font-display text-3xl font-semibold text-rose-800">
            Из моей кухни
          </h2>
          <PhotoStrip photos={photos} />
        </section>
      )}
    </>
  );
}
