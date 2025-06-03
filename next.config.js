/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  experimental: {
    serverExternalPackages: ['sqlite3'],
  },
};

module.exports = nextConfig;