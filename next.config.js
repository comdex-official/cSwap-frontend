/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  reactStrictMode: true,
  swcMinify: true,
  distDir: 'build',
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
