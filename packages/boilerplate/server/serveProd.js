import 'source-map-support/register'
import '@babel/polyfill'
import { resolve } from 'path'
import express from 'express'
import favicon from 'serve-favicon'
import clientStats from '../buildClient/stats.json' // eslint-disable-line import/no-unresolved
import serverRender from '../buildServer/h' // eslint-disable-line import/no-unresolved
import makeConfig from './webpack.config.babel'

// ASSUMPTION: the compiled version of this file is one directory under the boilerplate root
// (Otherwise importing '../buildXxxx' wouldn't work)

const res = (...args) => resolve(__dirname, ...args)

const { path: outputPath, publicPath } = makeConfig({ server: false }).output

const app = express()

app.use(favicon(res('../public', 'favicon.ico')))

// UNIVERSAL HMR + STATS HANDLING GOODNESS:

app.use(publicPath, express.static(outputPath))
app.use(serverRender({ clientStats, outputPath }))

app.listen(3000, () => {
  // eslint-disable-next-line no-console
  console.log('Listening @ http://localhost:3000/')
})
