const fs = require("fs");
const webpackConfig = require("./webpack.config");

webpackConfig.devtool = "inline-source-map";

webpackConfig.mode = "development";

webpackConfig.devServer = {
    host: "billment.co",
    allowedHosts: [".billment.co"],
    port: 8088,
    hot: true,
    https: {
        key: fs.readFileSync("./cert/billment.co+1-key.pem"),
        cert: fs.readFileSync("./cert/billment.co+1.pem"),
    },
};

webpackConfig.optimization = {
    runtimeChunk: "single",
};

webpackConfig.output = {
    pathinfo: true,
    publicPath: "/",
    filename: "[name].js",
};

module.exports = webpackConfig;
