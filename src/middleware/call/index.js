import { enhanceRoutes, shouldCall, createCache } from './utils'
import { noOp, isAction } from '../../utils'
import { BLOCK } from '../../types'

export default (name, config = {}) => (api) => {
  const { cache = false, prev = false, skipOpts = false } = config

  enhanceRoutes(name, api.routes, api.options)

  api.options.callbacks = api.options.callbacks || []
  api.options.callbacks.push(name)
  api.options.shouldCall = api.options.shouldCall || shouldCall

  if (cache) {
    api.cache = createCache(api, name, config)
  }

  return (req, next = noOp) => {
    const route = prev ? req.prevRoute : req.route

    const isCached = cache && api.cache.isCached(name, route, req)
    if (isCached) return next()

    const calls = req.options.shouldCall(name, route, req, config)
    if (!calls) return next()

    const r = (calls.route && route[name]) || noOp
    const o = (calls.options && !skipOpts && req.options[name]) || noOp

    req._dispatched = false // `dispatch` used by callbacks will set this to `true` (see core/createDispatch.js)

    return Promise.all([r(req), o(req)]).then(([r, o]) => {
      if (isFalse(r, o)) {
        // set the current callback name and whether its on the previous route (beforeLeave) or current
        // so that `req.confirm()` can temporarily delete it and pass through the pipeline successfully
        // in a confirmation modal or similar
        req.last = { name, prev }

        if (!req.tmp.committed) {
          req.block()
        }

        return false
      }

      const res = r || o

      if (res && !req._dispatched && isAutoDispatch(route, req.options)) { // if no dispatch was detected, and a result was returned, dispatch it automatically
        const action = isAction(res) ? res : { payload: res }
        action.type = action.type || `${req.action.type}_COMPLETE`

        return Promise.resolve(req.dispatch(action))
          .then((res) => {
            if (cache) api.cache.cacheAction(name, req.action)
            return res
          })
          .then(complete(next))
      }

      if (cache) api.cache.cacheAction(name, req.action)

      return complete(next)(res)
    })
  }
}

const isFalse = (r, o) => r === false || o === false

const complete = (next) => (res) => next().then(() => res)

const isAutoDispatch = (route, options) =>
  route.autoDispatch !== undefined
    ? route.autoDispatch
    : options.autoDispatch === undefined ? true : options.autoDispatch
