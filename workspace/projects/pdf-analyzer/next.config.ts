import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use Turbopack (Next.js 16 default) — empty config silences the webpack warning
  turbopack: {},
  // Suppress pdfjs-dist canvas warnings (we only use it for text extraction)
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
};

export default nextConfig;
