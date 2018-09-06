const path = require('path')

module.exports = {
  entry: {
    'parse-format': path.resolve(__dirname, 'src/docs/parse-format.js'),
    'async-validation': path.resolve(__dirname, 'src/docs/async-validation.js'),
    validation: path.resolve(__dirname, 'src/docs/validation.js'),
    basic: path.resolve(__dirname, 'src/docs/basic.js'),
  },
  output: {
    path: path.resolve(__dirname, 'docs'),
    filename: 'examples/[name].js'
  },
  devtool: this.mode === 'development' ? 'inline-source-map' : false,
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      }
    ]
  }
}
