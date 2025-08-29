/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    instrumentationHook: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Exclude test directories from build
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  webpack: (config, { isServer }) => {
    // Exclude test directories from build
    config.module.rules.push({
      test: /\.(ts|tsx|js|jsx)$/,
      exclude: [
        /node_modules/,
        /test/,
        /\.test\./,
        /\.spec\./
      ],
    });
    
    return config;
  },
  // Production optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Environment variables validation
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  async rewrites() {
    const docSlugRewrites = [
      { source: '/world-clock', destination: '/docs/world-clock/index.html' },
      { source: '/json-formatter', destination: '/docs/json-formatter/index.html' },
      { source: '/regex-tester', destination: '/docs/regex-tester/index.html' },
      { source: '/jwt-decoder', destination: '/docs/jwt-decoder/index.html' },
      { source: '/image-compressor', destination: '/docs/image-compressor/index.html' },
      { source: '/uuid-generator', destination: '/docs/uuid-generator/index.html' },
      { source: '/xpath-tester', destination: '/docs/xpath-tester/index.html' },
      { source: '/timestamp-converter', destination: '/docs/timestamp-converter/index.html' },
      { source: '/base64-encoder', destination: '/docs/base64-encoder/index.html' },
      { source: '/password-generator', destination: '/docs/password-generator/index.html' },
      { source: '/pwa-assets', destination: '/docs/pwa-assets/index.html' },
    ]
    return [
      // Serve static docs from public/docs when requesting folder paths
      { source: '/docs', destination: '/docs/index.html' },
      { source: '/docs/:slug', destination: '/docs/:slug/index.html' },
      ...docSlugRewrites,
    ]
  },
}

module.exports = nextConfig 