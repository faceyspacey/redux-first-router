import { enhanceRoutes } from '../middleware/call/utils' // unfortunate coupling (to potentially optional middleware)
import { formatRoutes } from '../utils'

export default ({ action, options, routes: allRoutes, hasMiddleware }) => {
  const env = process.env.NODE_ENV

  if (env === 'development' && !hasMiddleware('pathlessRoute')) {
    throw new Error('[rudy] "pathlessRoute" middleware is required to use "addRoutes" action creator.')
  }

  const { routes, formatRoute } = action.payload
  const format = formatRoute || options.formatRoute
  const newRoutes = formatRoutes(routes, format, true)
  const callbacks = options.callbacks || []

  callbacks.forEach(name => {
    enhanceRoutes(name, newRoutes, options)
  })

  Object.assign(allRoutes, newRoutes)
}
