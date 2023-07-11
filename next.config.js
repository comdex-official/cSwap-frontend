/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  reactStrictMode: true,
  swcMinify: true,
  distDir: 'build',
  images: {
    unoptimized: true,
  },
  publicRuntimeConfig: {
    // Will be available on both server and client
    staticFolder: '/static',
  },
  // Add the following line to specify the custom server file
  server: './server.js',
};

module.exports = nextConfig;
