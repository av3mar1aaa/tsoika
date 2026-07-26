import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "storage.yandexcloud.net",
        pathname: "/**",
      },
    ],
    // Загруженные фото ужимаются до 1600px (lib/upload.ts), а обложка — 1672px.
    // Варианты 2048 и 3840 из набора по умолчанию только растягивали исходник:
    // лишняя работа оптимизатора и лишние килобайты без выигрыша в качестве.
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    qualities: [75],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "250mb",
    },
  },
};

export default nextConfig;
