import { call } from './index'

export default (api) => {
  const middlewares = [
    call('thunk', { skipOpts: true }),
    call('onComplete', { skipOpts: true })
  ]

  const pipeline = api.options.compose(middlewares, api)

  // Registering is currently only used when core features (like the
  // `addRoutes` action creator) depend on the middleware being available.
  // See `utils/formatRoutes.js` for how `hasMiddleware` is used to throw
  // errors when not available.
  api.registerMiddleware('pathlessRouteThunk')

  return (req, next) => {
    const { route } = req

    if (route && !route.path && (route.thunk || route.middleware)) {
      if (route.dispatch !== false) {
        req.action = req.commitDispatch(req.action)
      }

      let res

      if (typeof route.thunk === 'function') {
        res = pipeline(req)
      }
      else if (Array.isArray(route.middleware)) {
        const pipeline = api.options.compose(route.middleware, api, true)
        res = pipeline(req)
      }

      return Promise.resolve(res)
        .then(res => res || req.action)
    }

    return next()
  }
}
