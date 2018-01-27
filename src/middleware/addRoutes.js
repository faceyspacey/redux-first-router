import { ADD_ROUTES } from '../types'
import { formatRoutes } from '../utils'
import { enhanceRoutes } from '../middleware/call/utils' // unfortunate coupling (to potentially optional middleware)

export default (api) => (req, next) => {
  if (req.action && req.action.type === ADD_ROUTES) {
    const { routes, formatRoute } = req.action.payload
    const format = formatRoute || req.options.formatRoute
    const newRoutes = formatRoutes(routes, format, true)

    const callbacks = api.options.callbacks || []

    callbacks.forEach(name => {
      enhanceRoutes(name, newRoutes)
    })

    Object.assign(req.routes, newRoutes)
    return req.commitDispatch(req.action)
  }

  return next()
}
