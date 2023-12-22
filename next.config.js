/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  reactStrictMode: false,
  swcMinify: true,
  distDir: 'build',
  images: {
    unoptimized: true,
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Modify the `config` here

    // Custom Module Rules
    config.module.rules.push({
      test: /\.js$/, // Apply this rule to JavaScript files
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader', // Use babel-loader to transpile JavaScript files
        options: {
          presets: ['next/babel'], // Use 'next/babel' preset along with any others you need
        },
      },
    });

    // Example to add a plugin (replace `YourPlugin` with an actual plugin)
    // config.plugins.push(new webpack.YourPlugin());

    // Custom URL fallback
    config.resolve.fallback = {
      ...config.resolve.fallback,
      url: require.resolve('url/'),
    };

    // Important: return the modified config
    return config;
  },
};

module.exports = nextConfig;
