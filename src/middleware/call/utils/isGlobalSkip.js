import { noOp } from './index'

export default (name, req, routeCb) =>
  isSkipGlobalCallbacks(name, req) || isFallback(name, req, routeCb)

const isFallback = (name, req, routeCb) => {
  const r = req.route && req.route.fallbackMode
  const g = req.options.fallbackMode

  if (routeCb === noOp) return false
  if (!r && !g) return false

  if (typeof r === 'boolean') return r
  if (r && typeof r === 'object') {
    if (r[name] !== undefined) return r[name]
    if (r.all !== undefined) return r.all
  }

  if (typeof g === 'boolean') return g
  if (g && typeof g === 'object') {
    if (g[name] !== undefined) return g[name]
    return g.all
  }

  return false
}

const isSkipGlobalCallbacks = (name, req) => {
  const r = req.route && req.route.skipGlobalCallbacks
  const g = req.options.skipGlobalCallbacks

  if (!r && !g) return false

  if (typeof r === 'boolean') return r
  else if (r && typeof r === 'object') {
    if (r[name] !== undefined) return r[name]
    if (r.all !== undefined) return r.all
  }

  if (typeof g === 'boolean') return g
  else if (g && typeof g === 'object') {
    if (g[name] !== undefined) return g[name]
    return g.all
  }

  return false
}
