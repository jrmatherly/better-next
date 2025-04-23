/** @type {import('next').NextConfig} */
import type { NextConfig } from 'next';
/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import './src/env';
import { withSentryConfig } from '@sentry/nextjs';

const nextConfig: NextConfig = {
  typescript: {
    tsconfigPath: './tsconfig.json',
  },
  reactStrictMode: true,
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        // google profile images
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        // github profile images
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        // vercel profile images
        protocol: 'https',
        hostname: 'avatar.vercel.sh',
      },
      {
        // vercel profile images
        protocol: 'https',
        hostname: 'startup-template-sage.vercel.app',
      },
      {
        // supabase profile images
        protocol: 'https',
        hostname: 'qpdwualqgmqaxfgoapyc.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'assets.aceternity.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'html.tailus.io',
        port: '',
      },
    ],
    // Optimize image quality and formats
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },
  // Enable aggressive code splitting
  experimental: {
    optimizeCss: true, // Enable CSS optimization
    optimizePackageImports: [
      'framer-motion',
      '@heroui/react',
      'tailwind-merge',
      'zod',
    ],
    // Improve page loading performance
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Optimize production builds
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Improve caching for better performance
  headers: async () => {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value:
              'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/(.*).(jpg|jpeg|png|webp|avif|ico|svg)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/(.*).(js|css)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Improve webpack configuration for better performance
  webpack: (config, { dev, isServer }) => {
    // Only run bundle analyzer in production build
    if (!dev && !isServer && process.env.SENTRY_ANALYZE === 'true') {
      // Add bundle analyzer in production when ANALYZE env var is set
      const withBundleAnalyzer = require('@next/bundle-analyzer')({
        enabled: true,
        analyzerMode: 'static',
        reportFilename: './analyze/client.html',
        openAnalyzer: false,
      });
      // Note: We don't push this to plugins directly
      // withBundleAnalyzer is used as a wrapper around the nextConfig
    }
    // Optimize webpack for better performance
    if (!config.infrastructureLogging) {
      config.infrastructureLogging = {};
    }
    config.infrastructureLogging.level = 'warn';

    // Reduce the number of logs in the console
    if (!config.stats) {
      config.stats = {};
    }
    config.stats.loggingDebug = false;
    config.stats.cached = false;

    return config;
  },
};

// Sentry configuration
const sentryConfig = {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  sentryUrl: process.env.SENTRY_URL,

  // Only print logs for uploading source maps in CI
  silent: !process.env.SENTRY_CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers
  tunnelRoute: '/monitoring',

  // Hides source maps from generated client bundles
  hideSourceMaps: true,

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors
  automaticVercelMonitors: true,
};

export default withSentryConfig(nextConfig, sentryConfig);
