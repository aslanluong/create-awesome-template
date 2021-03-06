import { join } from "path";
import HtmlWebpackPlugin from "html-webpack-plugin";
import { ESBuildPlugin, ESBuildMinifyPlugin } from "esbuild-loader";
import { Configuration, HotModuleReplacementPlugin } from "webpack";
import { CleanWebpackPlugin } from "clean-webpack-plugin";
import { VueLoaderPlugin } from "vue-loader";

const config: Configuration = {
  context: __dirname,
  entry: join(__dirname, "src/main.ts"),
  resolve: {
    extensions: [".ts", ".vue", ".js"],
    alias: { src: join(__dirname, "src") },
  },
  output: {
    path: join(__dirname, "dist"),
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
        test: /\.ts$/,
        use: {
          loader: "esbuild-loader",
          options: {
            loader: "ts",
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
      template: join(__dirname, "./index.html"),
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

export default config;
