const webpack = require('webpack')

module.exports = {
  context: __dirname + '/client',
  entry: [
    './index.js'
  ],
  output: {
    path: __dirname + '/dist',
    publicPath: '/assets/',
    filename: 'bundle.js'
  },
  resolve: {
    extensions: ['.js', '.styl', '.elm']
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/
      },
      {
        test: /\.styl$/,
        loader: 'style-loader!css-loader!stylus-loader'
      },
      {
        test: /\.elm$/,
        exclude: [/elm-stuff/, /node_modules/],
        loader: 'elm-webpack-loader'
      }
    ]
  }
}
