import MiniCssExtractPlugin from "mini-css-extract-plugin";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";
import Dotenv from "dotenv-webpack";
import { readFileSync } from "node:fs";
import ReactRefreshWebpackPlugin from "@pmmmwh/react-refresh-webpack-plugin";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

function readEnvFromFile(filePath) {
  try {
    const content = readFileSync(filePath, { encoding: "utf-8" });
    return content.split("\n").reduce((acc, line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return acc;
      const equalsIndex = trimmed.indexOf("=");
      if (equalsIndex <= 0) return acc;
      const key = trimmed.slice(0, equalsIndex).trim();
      const value = trimmed.slice(equalsIndex + 1).trim();
      acc[key] = value;
      return acc;
    }, {});
  } catch {
    return {};
  }
}

export default (env = {}, argv = {}) => {
  const mode = argv.mode || env.mode || process.env.NODE_ENV || "development";
  const isDev = mode === "development";
  const context = __dirname;
  const envFromFile = readEnvFromFile(path.resolve(context, ".env"));
  const devServerPort = Number.parseInt(
    process.env.TURBO_DEV_PORT || envFromFile.TURBO_DEV_PORT || "5002",
    10,
  );
  const domain = envFromFile.DOMAIN || process.env.DOMAIN || "";
  // When USE_PROXY is true, force client bundle to use same-origin for API (avoids CORS on Boltic/serverless).
  const useProxy =
    envFromFile.USE_PROXY === "true" || process.env.USE_PROXY === "true";
  const clientDomainForBundle = useProxy ? "" : domain || "api.fynd.com";

  const proxyTargetRaw =
    envFromFile.PROXY_TARGET || process.env.PROXY_TARGET || domain;
  const proxyTarget = !proxyTargetRaw
    ? ""
    : /^https?:\/\//i.test(String(proxyTargetRaw).trim())
      ? String(proxyTargetRaw).trim()
      : `https://${String(proxyTargetRaw).trim()}`;

  // `dotenv-webpack` also defines `process.env.DOMAIN` (via webpack DefinePlugin internally).
  // Set the desired client bundle value here to avoid conflicting DefinePlugin values.
  process.env.DOMAIN = clientDomainForBundle;

  return {
    entry: {
      app: [path.resolve(context, "theme/app.jsx")],
    },
    output: {
      path: path.resolve(context, "dist"),
      filename: isDev ? "[name].js" : "[name].[contenthash].js",
      publicPath: "/",
      clean: true,
    },
    resolve: {
      extensions: [".js", ".jsx", ".ts", ".tsx"],
      fullySpecified: false,
      alias: {
        "fdk-core/utils": path.resolve(context, "theme/fdk-core/utils.js"),
        "fdk-core/components": path.resolve(
          context,
          "theme/fdk-core/components.js",
        ),
      },
    },
    module: {
      rules: [
        {
          // Allow bare imports (no extension required) in .js/.jsx files even when
          // package.json has "type":"module" which enables strict ESM resolution.
          test: /\.(m?js|jsx)$/,
          resolve: { fullySpecified: false },
        },
        {
          test: /\.(ts|tsx)$/,
          exclude: /node_modules/,
          use: [
            {
              loader: "babel-loader",
              options: {
                presets: [
                  ["@babel/preset-env", { targets: "defaults" }],
                  "@babel/preset-react",
                  "@babel/preset-typescript",
                ],
                plugins: [
                  ...(isDev ? [require.resolve("react-refresh/babel")] : []),
                ],
              },
            },
          ],
        },
        {
          test: /\.(jsx|js)$/,
          include: path.resolve(context, "theme"),
          exclude: /node_modules/,
          use: [
            {
              loader: "babel-loader",
              options: {
                presets: [
                  ["@babel/preset-env", { targets: "defaults" }],
                  "@babel/preset-react",
                ],
                plugins: [
                  ...(isDev ? [require.resolve("react-refresh/babel")] : []),
                ],
              },
            },
          ],
        },
        {
          test: /\.css$/i,
          use: [
            MiniCssExtractPlugin.loader,
            { loader: "css-loader", options: { modules: false } },
          ],
        },
        {
          test: /\.less$/i,
          use: [
            MiniCssExtractPlugin.loader,
            { loader: "css-loader", options: { modules: false } },
            "less-loader",
          ],
          include: /\.global\.less$/,
        },
        {
          test: /\.less$/i,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: "css-loader",
              options: {
                modules: {
                  localIdentName: isDev
                    ? "[path][name]__[local]--[hash:base64:5]"
                    : "[hash:base64:5]",
                },
              },
            },
            "less-loader",
          ],
          exclude: /\.global\.less$/,
        },
        {
          test: /\.(png|jpg|jpeg|gif|webp)$/i,
          type: "asset/resource",
          generator: {
            publicPath: "/",
            outputPath: "assets/images/",
          },
        },
        {
          test: /\.(ttf|otf|woff|woff2)$/i,
          type: "asset/resource",
          generator: {
            publicPath: "/",
            outputPath: "assets/fonts/",
          },
        },
        {
          test: /\.svg$/,
          use: ["@svgr/webpack"],
        },
      ],
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: isDev ? "[name].css" : "[name].[contenthash].css",
        ignoreOrder: true,
      }),
      new HtmlWebpackPlugin({
        template: path.resolve(context, "public/index.html"),
        chunks: ["app"],
      }),
      new Dotenv({
        path: path.resolve(context, ".env"),
        safe: false,
        systemvars: true,
      }),
      ...(isDev
        ? [
            new ReactRefreshWebpackPlugin({
              overlay: false,
            }),
          ]
        : []),
    ],
    optimization: {
      minimizer: [`...`, new CssMinimizerPlugin()],
    },
    devServer: {
      static: {
        directory: path.resolve(context, "public"),
      },
      historyApiFallback: {
        disableDotRule: true,
        htmlAcceptHeaders: ["text/html", "application/xhtml+xml"],
      },
      hot: true,
      port: Number.isNaN(devServerPort) ? 5002 : devServerPort,
      open: false,
      proxy:
        useProxy && proxyTarget
          ? [
              {
                context: ["/service", "/ext", "/graphql"],
                target: proxyTarget,
                changeOrigin: true,
                secure: true,
                cookieDomainRewrite: "",
              },
            ]
          : [],
      setupMiddlewares: (middlewares, devServer) => {
        if (devServer?.app) {
          devServer.app.get("/favicon.ico", (_, res) => res.status(204).end());
        }
        return middlewares;
      },
    },
  };
};
