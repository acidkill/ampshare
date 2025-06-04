/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  serverExternalPackages: ['sqlite3'],
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb'
    },
    externalDir: true
  },
};

module.exports = nextConfig;
