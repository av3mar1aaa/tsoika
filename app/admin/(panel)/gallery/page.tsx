import { listGalleryPhotos } from "@/lib/gallery";
import GalleryManager from "@/components/admin/GalleryManager";

export const dynamic = "force-dynamic";

export default async function GalleryAdminPage() {
  const photos = await listGalleryPhotos();
  return (
    <div>
      <h1 className="mb-2 font-display text-2xl font-semibold text-rose-800">
        Лента на главной
      </h1>
      <p className="mb-6 text-sm text-rose-800/70">
        Эти фотографии показываются под приветствием на главной странице. Можно
        пролистывать влево-вправо.
      </p>
      <GalleryManager photos={photos} />
    </div>
  );
}
