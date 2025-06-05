import type {NextConfig} from 'next';
import { withHydrationOverlay } from '@builderio/react-hydration-overlay/next';

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone', // Required for an optimized Docker image
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
    domains: [], // Add domains for external images if needed
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  reactStrictMode: true,
  productionBrowserSourceMaps: false, // Added for production optimization
  compress: true, // Added for production optimization
  poweredByHeader: false, // Added for production optimization
  experimental: {
    mdxRs: true,
    serverComponentsExternalPackages: ["mongoose", "resend"],
    optimizeCss: true, // Added for production optimization
    scrollRestoration: true, // Added for production optimization
  },
  webpack: (config, { dev, isServer }) => {
    // Add any custom webpack configurations here
    if (!dev && !isServer) {
      // Enable tree shaking and dead code elimination
      config.optimization.usedExports = true;
    }
    return config;
  },
};

export default nextConfig;
