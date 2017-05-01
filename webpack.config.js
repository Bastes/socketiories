const webpack = require('webpack')

module.exports = {
  context: __dirname + '/client',
  entry: [
    './index.js'
  ],
  output: {
    path: __dirname + '/dist',
    filename: 'bundle.js'
  },
  resolve: {
    extensions: ['.js']
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['jsx-loader', 'babel-loader']
      }
    ]
  }
}
