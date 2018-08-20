import { call } from './index'

export default (...names) => (api) => {
  names[0] = names[0] || 'thunk'
  names[1] = names[1] || 'onComplete'

  const middlewares = names.map((name) => call(name, { skipOpts: true }))

  const pipeline = api.options.compose(
    middlewares,
    api,
  )

  // Registering is currently only used when core features (like the
  // `addRoutes` action creator) depend on the middleware being available.
  // See `utils/formatRoutes.js` for how `has` is used to throw
  // errors when not available.
  api.register('pathlessRoute')

  return (req, next) => {
    const { route } = req
    const isPathless = route && !route.path

    if (isPathless && hasCallback(route, names)) {
      if (route.dispatch !== false) {
        req.action = req.commitDispatch(req.action)
      }

      return pipeline(req).then((res) => res || req.action)
    }

    return next()
  }
}

const hasCallback = (route, names) =>
  names.find((name) => typeof route[name] === 'function')
