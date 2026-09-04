/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";

const nextConfig = {
  output: "export",
  basePath: isProd ? "/learn-prove-earn-project" : "",
  assetPrefix: isProd ? "/learn-prove-earn-project/" : "",

  images: {
    unoptimized: true,
  },

  typescript: {
    // Force Next.js build runner to ignore TS errors on production export
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;