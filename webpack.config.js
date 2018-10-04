const webpack = require('webpack')
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')

const env = process.env.NODE_ENV

const config = {
  mode: 'development',
  module: {
    rules: [{ test: /\.js$/, use: ['babel-loader'], exclude: /node_modules/ }]
  },
  output: {
    library: 'ReduxFirstRouter',
    libraryTarget: 'umd'
  },
  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(env)
    })
  ]
}

if (env === 'production') {
  config.mode = 'production'
  config.optimization = {
    minimizer: [
      new UglifyJSPlugin({
        uglifyOptions: {
          output: {
            comments: false,
            ascii_only: true
          },
          compress: {
            comparisons: false
          }
        }
      })
    ]
  }
}

module.exports = config
