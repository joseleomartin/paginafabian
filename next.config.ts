import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Evita que Next infiera como raíz un package-lock.json de una carpeta superior.
  outputFileTracingRoot: path.resolve(process.cwd()),
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "linkedinrss.cns.me",
        pathname: "/img/**",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
        pathname: "/vi/**",
      },
      {
        protocol: "https",
        hostname: "i4.ytimg.com",
        pathname: "/vi/**",
      },
      {
        protocol: "https",
        hostname: "media.licdn.com",
        pathname: "/**",
      },
      // Imágenes subidas desde el admin (Vercel Blob).
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
        pathname: "/uploads/**",
      },
    ],
  },
  async redirects() {
    return [
      // La sección "Novedades" pasó a llamarse "Prensa": se conservan los enlaces viejos.
      { source: "/novedades", destination: "/prensa", permanent: true },
    ];
  },
};

export default nextConfig;
