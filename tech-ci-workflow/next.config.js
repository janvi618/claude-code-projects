/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['playwright'],
  },
  // Serve exports directory for PDF downloads
  async rewrites() {
    return [
      {
        source: '/exports/:path*',
        destination: '/api/exports/:path*',
      },
    ]
  },
}

module.exports = nextConfig
