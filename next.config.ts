import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  basePath: isProd ? "/learn-prove-earn-project" : "",
  assetPrefix: isProd ? "/learn-prove-earn-project/" : "",

  images: {
    unoptimized: true,
  },

  typescript: {
    // Ignore TypeScript build errors during production build
    ignoreBuildErrors: true,
  },

  eslint: {
    // Ignore ESLint errors during production build
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;