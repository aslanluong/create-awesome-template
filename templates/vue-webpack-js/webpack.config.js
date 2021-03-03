const { join } = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { ESBuildPlugin, ESBuildMinifyPlugin } = require("esbuild-loader");
const { HotModuleReplacementPlugin } = require("webpack");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const { VueLoaderPlugin } = require("vue-loader");

/** @type { import("webpack").Configuration } */
module.exports = {
  context: __dirname,
  entry: join(__dirname, "src/main.js"),
  resolve: {
    extensions: [".js", ".vue"],
  },
  output: {
    path: join(__dirname, "/dist"),
    filename: "[name].[contenthash:8].js",
  },
  devtool: "cheap-module-source-map",
  module: {
    rules: [
      {
        test: /\.m?js$/,
        resolve: { fullySpecified: false },
      },
      {
        test: /\.vue$/,
        use: {
          loader: "vue-loader",
        },
      },
      {
        test: /\.png$/,
        use: {
          loader: "url-loader",
          options: { limit: 8192 },
        },
      },
      {
        test: /\.js$/,
        use: {
          loader: "esbuild-loader",
          options: {
            loader: "js",
            target: "esnext",
          },
        },
      },
      {
        test: /\.css$/,
        exclude: /node_modules/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: "svg-url-loader",
            options: {
              limit: 10000,
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: "index.html",
      inject: true,
      template: join(__dirname, "index.html"),
      favicon: join(__dirname, "src/assets/favicon.ico"),
    }),
    new HotModuleReplacementPlugin(),
    new VueLoaderPlugin(),
    new ESBuildPlugin(),
    new CleanWebpackPlugin({ cleanOnceBeforeBuildPatterns: ["**/*"] }),
  ],
  optimization: {
    minimize: true,
    minimizer: [new ESBuildMinifyPlugin({ target: "esnext" })],
  },
  performance: {
    hints: false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000,
  },
};
