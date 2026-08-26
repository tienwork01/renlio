import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Landing page tinh: khong can image optimization server-side
  images: { unoptimized: true },
};

export default nextConfig;
