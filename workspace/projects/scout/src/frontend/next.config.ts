import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Rewrite /api/* calls to the FastAPI backend
  // In production, Caddy handles routing — this is for local dev
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    return [
      {
        source: "/api/items/:path*",
        destination: `${backendUrl}/api/items/:path*`,
      },
      {
        source: "/api/briefs/:path*",
        destination: `${backendUrl}/api/briefs/:path*`,
      },
      {
        source: "/api/chat",
        destination: `${backendUrl}/api/chat`,
      },
      {
        source: "/api/admin/:path*",
        destination: `${backendUrl}/api/admin/:path*`,
      },
      {
        source: "/health",
        destination: `${backendUrl}/health`,
      },
    ];
  },
};

export default nextConfig;
