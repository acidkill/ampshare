/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb'
    },
    externalDir: true,
    serverExternalPackages: ['sqlite3']
  },
};

module.exports = nextConfig;