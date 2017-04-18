"use strict";
const webpack = require("webpack"),
    HtmlWebpackPlugin = require("html-webpack-plugin"),
  path = require("path");
module.exports = {
  entry: {
    "app": "./src/index"
  },
  output: {
    path: __dirname + '/dist',
    filename: "js/[name].bundle.js"
  },
  resolve: {
    extensions: ['.js', '.ts']
  },
  devtool: 'source-map',
  module: {
    rules: [
        {
            test: /\.js$/,
            exclude: [/node_modules/],
            use: [{
                loader: 'babel-loader'
            }],
        },
        {
            test: /\.thrift/,
            exclude: [/node_modules/],
            use: [{
                loader: 'file-loader'
            }],
        }
    ]
  },
  plugins: [
      new HtmlWebpackPlugin({
          title: 'test',
          template: 'src/template-index.ejs',
          inject: 'body'
      }),
  ],
  performance: { hints: false },
  devServer: {
    contentBase: path.join(__dirname, "dist"),
    historyApiFallback: true,
    port: 7000,
  }
};
