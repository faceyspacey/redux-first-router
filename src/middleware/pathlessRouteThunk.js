import { call } from './index'

export default (api) => {
  const middlewares = [
    call('thunk', { skipOpts: true }),
    call('onComplete', { skipOpts: true })
  ]

  const pipelineBranch = api.options.compose(middlewares, api)

  // Registering is currently only used when core features (like the
  // `addRoutes` action creator) depend on the middleware being available.
  // See `utils/formatRoutes.js` for how `hasMiddleware` is used to throw
  // errors when not available.
  api.registerMiddleware('pathlessRouteThunk')

  return (req, next) => {
    if (req.route && !req.route.path && typeof req.route.thunk === 'function') {
      req.action = req.commitDispatch(req.action)

      const res = pipelineBranch(req)
      return Promise.resolve(res)
        .then(res => res || req.action)
    }

    return next()
  }
}
