import { enhanceRoutes, shouldCall, createCache, autoDispatch } from './utils'
import { noOp } from '../../utils'

export default (name, config = {}) => (api) => {
  const {
    cache = false,
    prev = false,
    skipOpts = false,
    start = false,
  } = config

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

    if (start) {
      const action = { ...req.action, type: `${req.type}_START` }
      req.commitDispatch(action)
      req._start = true
    }

    return Promise.all([
      autoDispatch(req, r, route, name),
      autoDispatch(req, o, route, name, true),
    ]).then(([r, o]) => {
      req._start = false

      if (isFalse(r, o)) {
        // set the current callback name and whether its on the previous route (beforeLeave) or current
        // so that `req.confirm()` can temporarily delete it and pass through the pipeline successfully
        // in a confirmation modal or similar
        req.last = { name, prev }

        if (!req.tmp.committed) {
          req.block() // update state.blocked === actionBlockedFrom
        }

        return false
      }

      if (req.ctx.doubleDispatchRedirect) {
        // dispatches to current location during redirects blocked, see `transformAction/index.js`
        const res = r !== undefined ? r : o
        return req.handleDoubleDispatchRedirect(res)
      }

      // `_dispatched` is a flag used to find whether actions were already dispatched in order
      // to determine whether to automatically dispatch it. The goal is not to dispatch twice.
      //
      // We delete these keys so they don't show up in responses returned from `store.dispatch`
      // NOTE: they are only applied to responses, which often are actions, but only AFTER they
      // are dispatched. This way reducers never see this key. See `core/createRequest.js`
      if (r) delete r._dispatched
      if (o) delete o._dispatched

      if (cache) req.cache.cacheAction(name, req.action)

      const res = r !== undefined ? r : o
      return next().then(() => res)
    })
  }
}

const isFalse = (r, o) => r === false || o === false
