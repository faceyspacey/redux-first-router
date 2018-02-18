import { call } from './index'

export default (name1 = 'thunk', name2 = 'onComplete') => (api) => {
  const middlewares = [
    call(name1, { skipOpts: true }),
    call(name2, { skipOpts: true })
  ]

  const pipeline = api.options.compose(middlewares, api)

  // Registering is currently only used when core features (like the
  // `addRoutes` action creator) depend on the middleware being available.
  // See `utils/formatRoutes.js` for how `hasMiddleware` is used to throw
  // errors when not available.
  api.registerMiddleware('pathlessRoute')

  return (req, next) => {
    const { route } = req

    if (route && !route.path && typeof route[name1] === 'function') {
      if (route.dispatch !== false) {
        req.action = req.commitDispatch(req.action)
      }

      const res = pipeline(req)
      return Promise.resolve(res)
        .then(res => res || req.action)
    }

    return next()
  }
}
