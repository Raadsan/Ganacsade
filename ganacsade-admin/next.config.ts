import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false, // Disable to reduce hydration warnings
  
  // Empty turbopack config to silence the warning
  turbopack: {},
};

export default nextConfig;
