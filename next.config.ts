import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: "export",
    basePath: "/learn-prove-earn-project",
    assetPrefix: "/learn-prove-earn-project/",
    images: {
        unoptimized: true,
    },
};

export default nextConfig;