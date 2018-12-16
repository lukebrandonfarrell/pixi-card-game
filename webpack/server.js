const PORT = parseInt(process.argv[2]) || 8080;

import webpack from "webpack";
import WebpackDevServer from "webpack-dev-server";
import webpackDevConfig from "./config.js";

webpackDevConfig.entry.unshift(`webpack-dev-server/client?http://localhost:${PORT}`, "webpack/hot/dev-server");

const compiler = webpack(webpackDevConfig);
const server = new WebpackDevServer(compiler, { ...webpackDevConfig, hot: true });
server.listen(PORT);

console.log(`Dev server listening at http://localhost:${PORT}`);
