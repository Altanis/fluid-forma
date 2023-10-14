const webpack = require("webpack");
const path = require("path");
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
    entry: {
        ["fluid"]: path.join(__dirname, "src", "Index.ts"),
    },
    output: {
        filename: "fluid.js", 
        path: path.join(__dirname, "public"),
    },
    module: {
        rules: [{
            test: /\.ts$/,
            use: "ts-loader"
        }]
    },
    resolve: {
        extensions: [".ts"],
        alias: {
            "src": path.resolve(__dirname, "src")
        },
    },
    optimization: {
        minimize: false,
        minimizer: [
            new TerserPlugin({
                include: /\.min\.js$/
            }),
        ],
    },
    mode: "production",
};