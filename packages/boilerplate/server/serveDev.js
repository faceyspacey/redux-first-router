/* eslint-disable import/no-extraneous-dependencies */

import 'source-map-support/register'
import '@babel/polyfill'
import path from 'path'
import express from 'express'
import favicon from 'serve-favicon'
import webpack from 'webpack'
import webpackDevMiddleware from 'webpack-dev-middleware'
import webpackHotMiddleware from 'webpack-hot-middleware'
import webpackHotServerMiddleware from 'webpack-hot-server-middleware'
import makeConfig from './webpack.config.babel'

const clientConfig = makeConfig({ server: false })
const serverConfig = makeConfig({ server: true })

const { publicPath, outputPath } = clientConfig.output

const app = express()

app.use(favicon(path.resolve(__dirname, '../public', 'favicon.ico')))

// UNIVERSAL HMR + STATS HANDLING GOODNESS:

const multiCompiler = webpack([clientConfig, serverConfig])
const clientCompiler = multiCompiler.compilers[0]

app.use(
  webpackDevMiddleware(multiCompiler, {
    publicPath,
    serverSideRender: true,
  }),
)
app.use(webpackHotMiddleware(clientCompiler))

// keeps serverRender updated with arg: { clientStats, outputPath }
app.use(
  webpackHotServerMiddleware(multiCompiler, {
    serverRendererOptions: { outputPath },
    chunkName: 'h',
  }),
)

app.listen(3000, () => {
  // eslint-disable-next-line no-console
  console.log('Listening @ http://localhost:3000/')
})
