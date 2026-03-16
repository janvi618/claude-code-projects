import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["nodemailer"],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        dns: false,
        tls: false,
        crypto: false,
      };
    }
    return config;
  },
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
