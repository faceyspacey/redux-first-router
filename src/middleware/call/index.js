import { enhanceRoutes, shouldCall, createCache } from './utils'
import { noOp } from '../../utils'

export default (name, config = {}) => (api) => {
  const { cache = false, prev = false, skipOpts = false, start = false } = config

  enhanceRoutes(name, api.routes, api.options)

  api.options.callbacks = api.options.callbacks || []
  api.options.callbacks.push(name)
  api.options.shouldCall = api.options.shouldCall || shouldCall

  if (cache) {
    api.cache = createCache(api, name, config)
  }

  return (req, next = noOp) => {
    const rt = prev ? req.prevRoute : req.route

    const isCached = cache && api.cache.isCached(name, rt, req)
    if (isCached) return next()

    const calls = req.options.shouldCall(name, rt, req, config)
    if (!calls) return next()

    const r = (calls.route && rt[name]) || noOp
    const o = (calls.options && !skipOpts && req.options[name]) || noOp

    if (start) {
      const action = { ...req.action, type: `${req.type}_START` }
      req.commitDispatch(action)
      req._start = true
    }

    return Promise.all([
      Promise.resolve(r(req)).then(r => autoDis(req, r, rt, name, next)),
      Promise.resolve(o(req)).then(o => autoDis(req, o, rt, name, next, true))
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

      if (req.ctx.doubleDispatchRedirect) { // dispatches to current location during redirects blocked, see `transformAction/index.js`
        const attemptedAction = req.ctx.doubleDispatchRedirect
        delete req.ctx.doubleDispatchRedirect
        req.cancelled = true
        req.setFrom()
        const res = r !== undefined ? r : o
        return res !== undefined ? res : attemptedAction
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
      return complete(next)(res)
    })
  }
}

const isFalse = (r, o) => r === false || o === false

const complete = (next) => (res) => next().then(() => res)

const autoDis = (req, res, route, name, next, isOptCb) => {
  if (res === false) return false
  const hasReturn = res === null || (res && !res._dispatched) // `res._dispatched` indicates it was manually dispatched

  if (hasReturn && isAutoDispatch(route, req.options, isOptCb)) { // if no dispatch was detected, and a result was returned, dispatch it automatically
    return Promise.resolve(req.dispatch(res))
  }

  return res
}

const isAutoDispatch = (route, options, isOptCb) =>
  isOptCb
    ? options.autoDispatch === undefined ? true : options.autoDispatch
    : route.autoDispatch !== undefined
      ? route.autoDispatch
      : options.autoDispatch === undefined ? true : options.autoDispatch

