const webpackDevMiddleware = require("webpack-dev-middleware");
const webpack = require("webpack");

module.exports = function (configPath) {
  var webpackConfig = require(configPath);
  var compiler = webpack(webpackConfig);
  return webpackDevMiddleware(compiler, {
    publicPath: '/'
  });
};

