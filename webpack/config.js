import path from "path";
import webpack from "webpack";

export default {
    entry: ["babel-polyfill", "./src/index.js"],

    output: {
        path: path.resolve(__dirname, "../dist"),
        publicPath: "/",
        filename: "game.js"
    },

    node: {
        fs: "empty"
    },

    resolve: {
        root: [ path.resolve(__dirname, "../src") ],
        extensions: [".js", ""]
    },

    stats: {
        colors: true,
        chunks: false
    },

    devtool: "#source-map",

    plugins: [
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.NoErrorsPlugin(),
        new webpack.HotModuleReplacementPlugin()
    ],

    module: {
        loaders: [{
            test: /\.js$/,
            include: [
                path.resolve(__dirname, "../src")
            ],
            loader: "babel-loader",
        }],
        preLoaders: [{
            test: /\.js$/,
            include: [
                path.resolve(__dirname, "../src")
            ],
            loader: "eslint-loader",
        }]
    },

    eslint: {
        failOnWarning: false,
        failOnError: false,
        emitWarning: true,
        quiet: true
    },

    historyApiFallback: {
        index: "index.html"
    },

    contentBase: path.resolve(`${__dirname}/../static`)
};
