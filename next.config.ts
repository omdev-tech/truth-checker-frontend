import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  i18n: {
    locales: ['en', 'fr'],
    defaultLocale: 'en',
    localeDetection: false,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb', // Increase body size limit to 50MB for file uploads
    },
  },
};

export default nextConfig;
