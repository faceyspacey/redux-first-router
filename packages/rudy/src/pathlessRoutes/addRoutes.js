// @flow
import { enhanceRoutes } from '../middleware/call/utils' // unfortunate coupling (to potentially optional middleware)
import { formatRoutes } from '../utils'
import type { AddRoutes } from '../flow-types'

export default (req: AddRoutes): void => {
  const { action, options, routes: allRoutes, has } = req

  const env = process.env.NODE_ENV

  if (env === 'development' && !has('pathlessRoute')) {
    throw new Error(
      '[rudy] "pathlessRoute" middleware is required to use "addRoutes" action creator.',
    )
  }

  const { routes, formatRoute } = action.payload
  const formatter = formatRoute || options.formatRoute
  const newRoutes = formatRoutes(routes, formatter, true)
  const callbacks = options.callbacks || []

  callbacks.forEach((name) => enhanceRoutes(name, newRoutes, options))

  Object.assign(allRoutes, newRoutes)

  action.payload.routes = newRoutes
  action.payload.routesAdded = Object.keys(routes).length // we need something to triggering updating of Link components when routes added

  req.commitDispatch(action)
}
