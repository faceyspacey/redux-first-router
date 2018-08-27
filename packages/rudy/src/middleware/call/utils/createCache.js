import { isServer, toAction } from '../../../utils'

const defaultCreateCacheKey = (action, name) => {
  const { type, basename, location } = action
  const { pathname, search } = location
  return `${name}|${type}|${basename}|${pathname}|${search}` // don't cache using URL hash, as in 99.999% of all apps its the same route
}

const callbacks = []

export default (api, name, config) => {
  if (config.prev) {
    throw new Error(
      `[rudy] call('${name}') middleware 'cache' option cannot be used with 'prev' option`,
    )
  }

  callbacks.push(name)
  if (api.cache) return api.cache

  const { createCacheKey = defaultCreateCacheKey } = api.options
  const cache = (config.cacheStorage = config.cacheStorage || {})

  const isCached = (name, route, req) => {
    if (isServer()) return false

    const { options, action } = req

    if (!route.path || route.cache === false) return false
    if (options.cache === false && route.cache === undefined) return false

    const key = createCacheKey(action, name)

    if (req.getKind() === 'load' && req.isUniversal()) {
      cache[key] = true
    }

    if (cache[key]) return true

    return false
  }

  const cacheAction = (name, action) => {
    const key = createCacheKey(action, name)
    cache[key] = true
    return key
  }

  const clear = (invalidator, opts = {}) => {
    if (!invalidator) {
      for (const k in cache) delete cache[k]
    } else if (typeof invalidator === 'function') {
      // allow user to customize cache clearing algo
      const newCache = invalidator(cache, api, opts) // invalidators should mutably operate on the cache hash
      if (newCache) {
        // but if they don't we'll merge into the same object reference
        for (const k in cache) delete cache[k]
        Object.assign(cache, newCache)
      }
    } else if (typeof invalidator === 'string') {
      // delete all cached items for TYPE or other string
      for (const k in cache) {
        if (k.indexOf(invalidator) > -1) delete cache[k]
      }
    } else {
      // delete all/some callbacks for precise item (default)
      const action = invalidator
      const act = toAction(api, action)
      const names = opts.name === undefined ? callbacks : [].concat(opts.name)

      names.forEach((name) => {
        const key = createCacheKey(act, name)
        delete cache[key]
      })
    }
  }

  return { isCached, cacheAction, clear }
}
