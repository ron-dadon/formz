const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const SIZE_100KB = 100 * 1024 * 1024

module.exports = {
  entry: path.resolve(__dirname, 'src/docs/index.js'),
  output: {
    path: path.resolve(__dirname, 'docs'),
    filename: 'index.js'
  },
  devtool: this.mode === 'development' ? 'inline-source-map' : false,
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /\.css$/,
        loader: ['style-loader', 'css-loader']
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: SIZE_100KB
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({ title: 'Formz | Painless React forms | Examples' })
  ]
}
