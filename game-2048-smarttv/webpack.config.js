const path = require("path");
const webpack = require("webpack");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const CleanPlugin = require("clean-webpack-plugin");

module.exports = () => {
  const platform = process.argv[2]?.substring(2);
  const environment = process.argv[3]?.substring(2);
  console.log(platform, "------", environment, process.argv);
  return {
    entry: "./src/index.tsx",
    mode: "development",
    output: {
      filename: "bundle.js",
      path: path.resolve(__dirname, "dist"),
      publicPath: "/",
    },
    devtool: "inline-source-map",
    devServer: {
      contentBase: "./public",
      hot: true,
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: "ts-loader",
          exclude: /node_modules/,
        },
        {
          test: /\.scss$/i,
          use: ["style-loader", "css-loader", "sass-loader"],
        },
        {
          test: /\.m?js$/,
          use: {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env"],
            },
          },
        },
        {
          test: /\.(png|jpg|gif|svg)$/i,
          use: [{ loader: "url-loader" }],
        },
      ],
    },
    plugins: [
      new CleanPlugin.CleanWebpackPlugin(),
      new webpack.DefinePlugin({
        "process.env": {
          TARGET_ENV: JSON.stringify(environment),
          PLATFORM: JSON.stringify(platform),
        },
      }),
      new CopyWebpackPlugin([
        {
          context: __dirname + "/src",
          from: `platform/${platform}`,
          to: __dirname + "/dist",
        },
        {
          context: __dirname + "/src",
          from: "assets",
          to: __dirname + "/dist",
        },
      ]),
    ],
    resolve: {
      extensions: [".ts", ".js", ".tsx"],
    },
  };
};
