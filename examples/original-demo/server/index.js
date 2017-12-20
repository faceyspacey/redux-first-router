import 'babel-polyfill'
import path from 'path'
import express from 'express'
import favicon from 'serve-favicon'
import cookieParser from 'cookie-parser'
import webpack from 'webpack'
import webpackDevMiddleware from 'webpack-dev-middleware'
import webpackHotMiddleware from 'webpack-hot-middleware'
import webpackHotServerMiddleware from 'webpack-hot-server-middleware'
import clientConfig from '../webpack/client.dev'
import serverConfig from '../webpack/server.dev'
import { findVideos, findVideo } from './api'

const DEV = process.env.NODE_ENV === 'development'
const publicPath = clientConfig.output.publicPath
const outputPath = clientConfig.output.path
const app = express()

app.use(favicon(path.resolve(__dirname, '../public', 'favicon.ico')))

// JWTOKEN COOKIE - in a real app obviously you set this after signup/login:

app.use(cookieParser())

app.use((req, res, next) => {
  const cookie = req.cookies.jwToken
  const jwToken = 'fake' // TRY: set to 'real' to authenticate ADMIN route

  if (cookie !== jwToken) {
    res.cookie('jwToken', jwToken, { maxAge: 900000 })
    req.cookies.jwToken = jwToken
  }

  next()
})

// API

app.get('/api/videos/:category', async (req, res) => {
  const jwToken = req.headers.authorization.split(' ')[1]
  const data = await findVideos(req.params.category, jwToken)
  res.json(data)
})

app.get('/api/video/:slug', async (req, res) => {
  const jwToken = req.headers.authorization.split(' ')[1]
  const data = await findVideo(req.params.slug, jwToken)
  res.json(data)
})

// UNIVERSAL HMR + STATS HANDLING GOODNESS:

if (DEV) {
  const multiCompiler = webpack([clientConfig, serverConfig])
  const clientCompiler = multiCompiler.compilers[0]

  app.use(webpackDevMiddleware(multiCompiler, { publicPath }))
  app.use(webpackHotMiddleware(clientCompiler))
  app.use(
    // keeps serverRender updated with arg: { clientStats, outputPath }
    webpackHotServerMiddleware(multiCompiler, {
      serverRendererOptions: { outputPath }
    })
  )
}
else {
  const clientStats = require('../buildClient/stats.json') // eslint-disable-line import/no-unresolved
  const serverRender = require('../buildServer/main.js').default // eslint-disable-line import/no-unresolved

  app.use(publicPath, express.static(outputPath))
  app.use(serverRender({ clientStats, outputPath }))
}

app.listen(3000, () => {
  console.log('Listening @ http://localhost:3000/')
})
