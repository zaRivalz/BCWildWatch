import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [{
      source: '/(.*)',
      headers: [{
        key: 'Content-Security-Policy',
        value: "frame-src 'self' https://app.powerbi.com https://copilotstudio.microsoft.com https://*.microsoft.com; frame-ancestors 'self';",
      }],
    }];
  },
};

export default nextConfig;
