import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: process.env.NEXT_PUBLIC_EXPORT === 'true' ? 'export' : undefined,
  assetPrefix: process.env.NEXT_PUBLIC_EXPORT === 'true' ? './' : '',
  trailingSlash: true,
  typescript: {
    ignoreBuildErrors: process.env.NEXT_PUBLIC_EXPORT === 'true',
  },
  // @ts-ignore
  eslint: {
    ignoreDuringBuilds: process.env.NEXT_PUBLIC_EXPORT === 'true',
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
