import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  cacheLife: {
    permanent: {
      expire: Number.MAX_VALUE,
      revalidate: Number.MAX_VALUE,
      stale: Number.MAX_VALUE,
    },
  },
  experimental: {
    serverActions: {
      // docx アップロードを Server Action で受け取るためサイズ上限を引き上げる
      bodySizeLimit: "10mb",
    },
  },
  images: {
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      {
        hostname: "paqxpxuxtypgoujythgz.supabase.co",
        protocol: "https",
      },
      {
        hostname: "placehold.co",
        protocol: "https",
      },
      {
        hostname: "127.0.0.1",
        protocol: "http",
      },
    ],
  },
  serverExternalPackages: ["pino"],
  typedRoutes: true,
};

export default nextConfig;
