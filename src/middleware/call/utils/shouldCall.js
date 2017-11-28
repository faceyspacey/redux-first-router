import { isHydrate, isServer } from '../../../utils'

export default (req, name, config) => {
  const state = req.getLocation()
  const kind = req.action.location && req.action.location.kind

  if (config.cache && isCached(req, name, config)) return false
  if (/setState|reset/.test(kind)) return false
  if (isHydrate(state, 'init') && /before/.test(name)) return false
  if (isServer() && /onLeave|onEnter/.test(name)) return false
  if (isHydrate(state) && name === 'thunk') return false
  if (name === 'beforeLeave' && state.kind === 'init') return false
  if (name === 'onLeave' && state.kind === 'load') return false

  return true
}

const isCached = (req, name, config) => {
  if (process.env.NODE_ENV === 'test') return false

  const { pathname, search } = req.action.location
  const { createCacheKey } = req.options

  const key = createCacheKey
    ? createCacheKey(req, name, config)
    : name + pathname + search // don't cache using URL hash, as in most apps its the same route

  if (cache[key]) return true

  cache[key] = true
  return false
}

const cache = {}
