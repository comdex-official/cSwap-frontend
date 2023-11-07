/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  reactStrictMode: false,
  swcMinify: true,
  distDir: 'build',
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
