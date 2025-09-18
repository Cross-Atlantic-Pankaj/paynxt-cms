/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Suppress antd compatibility warnings
    config.ignoreWarnings = [
      /antd.*compatible/,
      /antd.*React.*16.*18/
    ];
    return config;
  },
  // Suppress console warnings in development
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // Set default port for development
  env: {
    PORT: '3004'
  }
};

export default nextConfig;
