import { isServer, actionToUrl } from '../../../utils'
import { createLocation } from '../../../history/utils'

const defaultCreateCacheKey = (action, name) => {
  const { type, location } = action
  const { basename, pathname, search } = location
  return `${name}|${type}|${basename}|${pathname}|${search}` // don't cache using URL hash, as in 99.999% of all apps its the same route
}

const callbacks = []

export default (api, name) => {
  callbacks.push(name)
  if (api.clearCache) return api.clearCache

  const { shouldCall, createCacheKey = defaultCreateCacheKey } = api.options
  let cache = {}

  api.options.shouldCall = (name, route, req, config) => {
    if (isCached(name, route, req, config)) return false
    return shouldCall(name, route, req, config)
  }

  const isCached = (name, route, req, config) => {
    if (!config.cache || isServer()) return false

    const { options, action } = req
    const noCallback = !req.route[name] && !options[name]

    if (noCallback) return true

    if (!route.path || route.cache === false) return false
    if (options.cache === false && route.cache === undefined) return false

    const key = createCacheKey(action, name)

    if (cache[key]) return true
    cache[key] = true

    return false
  }

  const clearCache = (action, opts = {}) => {
    if (!action) {
      cache = {}
    }
    else if (typeof action === 'function') {      // allow user to customize cache clearing algo
      cache = action(cache, api, opts) || cache
    }
    else if (typeof action === 'string') {        // delete all cached items for TYPE or other string
      for (const k in cache) {
        if (k.indexOf(action) > -1) delete cache[k]
      }
    }
    else {                                        // delete all/some callbacks for precise item (default)
      const loc = createLocation(actionToUrl(action, api.routes, api.options))
      const act = { ...action, location: { ...action.location, ...loc } }

      const names = opts.name === undefined ? callbacks : [].concat(opts.name)

      names.forEach(name => {
        const key = createCacheKey(act, name)
        delete cache[key]
      })
    }
  }

  return clearCache
}
