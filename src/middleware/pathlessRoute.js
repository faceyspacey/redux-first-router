import { call } from './index'
import { UPDATE_HISTORY } from '../types'

export default (...names) => (api) => {
  names[0] = names[0] || 'thunk'
  names[1] = names[1] || 'onComplete'

  const middlewares = names.map(name => {
    return call(name, { skipOpts: true })
  })

  const pipeline = api.options.compose(middlewares, api)

  // Registering is currently only used when core features (like the
  // `addRoutes` action creator) depend on the middleware being available.
  // See `utils/formatRoutes.js` for how `hasMiddleware` is used to throw
  // errors when not available.
  api.registerMiddleware('pathlessRoute')

  return (req, next) => {
    const { route, action } = req
    const isPathless = route && !route.path && action.type !== UPDATE_HISTORY

    if (isPathless && hasCallback(route, names, action.type)) {
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

const hasCallback = (route, names, type) => {
  const hasCb = names.find(name => typeof route[name] === 'function')
  console.log('HASCALLBACK', hasCb, type)
  return hasCb
}
