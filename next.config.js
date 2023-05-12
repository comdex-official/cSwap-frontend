/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  distDir: "build",
  images: {
    domains: ["raw.githubusercontent.com"],
  },
};

module.exports = nextConfig;
