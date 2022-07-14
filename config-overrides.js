const {
  override,
  fixBabelImports,
  addLessLoader,
  addWebpackModuleRule,
} = require("customize-cra");

module.exports = override(
  fixBabelImports("import", {
    libraryName: "antd",
    libraryDirectory: "es",
    style: true,
  }),
  addLessLoader({
    javascriptEnabled: true,
  }),
  addWebpackModuleRule({
    test: /\.scss$/,
    issuer: /\.less$/,
    use: {
      loader: "./src/sassVarsToLess.js",
    },
  })
);
