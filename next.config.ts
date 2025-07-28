import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: '/api/binance/:path*',
        destination: 'https://api.binance.com/api/v3/:path*',
      },
      // WebSocket rewrite with proper protocol
      {
        source: '/ws/binance/:path*',
        destination: 'https://stream.binance.com:9443/ws/:path*', 
      },
    ];
  },
};

export default nextConfig;