const webpack = require('webpack')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

module.exports = (env) => ({
  module: {
    rules: [
      { test: /\.js$/, loaders: ['babel-loader'], exclude: /node_modules/ },
    ],
  },
  output: {
    library: 'ReduxFirstRouter',
    libraryTarget: 'umd',
  },
  plugins: [new webpack.optimize.OccurrenceOrderPlugin()],
  optimization: {
    minimize: JSON.parse(env.minimize),
    minimizer: [
      new UglifyJsPlugin({
        minify: (file, sourceMap) => {
          const terserOptions = {
            compress: {
              pure_getters: true,
              unsafe: true,
              unsafe_comps: true,
              warnings: false,
            },
            sourceMap: sourceMap && {
              content: sourceMap,
            },
            ie8: true,
          }

          // eslint-disable-next-line global-require
          return require('terser').minify(file, terserOptions)
        },
      }),
    ],
  },
})
