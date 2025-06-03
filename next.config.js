/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  experimental: {
    serverActions: true,
    externalDir: true,
    serverComponentsExternalPackages: ['sqlite3']
  },
};

module.exports = nextConfig;