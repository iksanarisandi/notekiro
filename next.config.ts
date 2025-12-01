import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configure for Cloudflare Pages deployment
  experimental: {
    // Use edge runtime for Cloudflare Workers compatibility
    runtime: 'experimental-edge',
  },
};

export default nextConfig;
