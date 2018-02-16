// @flow
import { NOT_FOUND, ADD_ROUTES, CHANGE_BASENAME, CLEAR_CACHE, CONFIRM, CALL_HISTORY } from '../types'
import { redirect } from '../actions'
import type { RoutesMap, RoutesMapInput } from '../flow-types'
import { enhanceRoutes } from '../middleware/call/utils' // unfortunate coupling (to potentially optional middleware)
import { actionToUrl } from './index'
import { createLocation } from '../history/utils/location'

const formatRoutes = (
  routes: RoutesMapInput,
  formatRoute: ?Function,
  isAddRoutes: boolean = false
): RoutesMap => {
  if (!isAddRoutes) routes[NOT_FOUND] = routes[NOT_FOUND] || {}

  routes[ADD_ROUTES] = routes[ADD_ROUTES] || { thunk: addRoutes }
  routes[CHANGE_BASENAME] = routes[CHANGE_BASENAME] || { thunk: changeBasename }
  routes[CLEAR_CACHE] = routes[CLEAR_CACHE] || { thunk: clearCache }
  routes[CONFIRM] = routes[CONFIRM] || { thunk: confirm }
  routes[CALL_HISTORY] = routes[CALL_HISTORY] || { thunk: callHistory }

  for (const type in routes) {
    const route = format(routes[type], type, routes, formatRoute, isAddRoutes)

    route.type = type
    if (route.redirect) createRedirect(route, routes)
    routes[type] = route
  }

  // work on NOT_FOUND again after above for loop so we have properly formatted route object
  if (!isAddRoutes) {
    routes[NOT_FOUND].path = routes[NOT_FOUND].path || '/not-found'
  }

  return routes
}

export default formatRoutes

export const format = (r, type, routes, formatRoute, isAddRoutes) => {
  const route = typeof r === 'string' ? { path: r } : r

  if (formatRoute) {
    return formatRoute(route, type, routes, isAddRoutes)
  }

  if (typeof route === 'function') {
    return { thunk: route }
  }

  return route
}

const createRedirect = (route, routes) => {
  const t = route.redirect
  const scenicType = `${route.scene}/${t}`
  const type = routes[scenicType] ? scenicType : t

  route.redirectBeforeEnter = ({ action, dispatch }) => {
    return dispatch(redirect({ ...action, type }, 301))
  }
}


// pathlessRouteThunks which listen to corresponding action creators:

const addRoutes = ({ action, options, routes: allRoutes, hasMiddleware }) => {
  const env = process.env.NODE_ENV

  if (env === 'development' && !hasMiddleware('pathlessRouteThunk')) {
    throw new Error('[rudy] "pathlessRouteThunk" middleware is required to use "addRoutes" action creator.')
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


const changeBasename = ({ initialLocation, action, hasMiddleware }) => {
  const env = process.env.NODE_ENV

  if (env === 'development' && !hasMiddleware('pathlessRouteThunk')) {
    throw new Error('[rudy] "pathlessRouteThunk" middleware is required to use "changeBasename" action creator without passing an action.')
  }

  const { type, params, query, state, hash } = initialLocation
  const { basename } = action.payload
  return { type, params, query, state, hash, basename }
}


const clearCache = ({ cache, action, hasMiddleware }) => {
  const env = process.env.NODE_ENV

  if (env === 'development' && !hasMiddleware('pathlessRouteThunk')) {
    throw new Error('[rudy] "pathlessRouteThunk" middleware is required to use "clearCache" action creator.')
  }

  const { invalidator, options } = action.payload
  cache.clear(invalidator, options)
}


const confirm = ({ ctx, action, hasMiddleware }) => {
  const env = process.env.NODE_ENV

  if (env === 'development' && !hasMiddleware('pathlessRouteThunk')) {
    throw new Error('[rudy] "pathlessRouteThunk" middleware is required to use "confirm" action creator.')
  }

  const { canLeave } = action.payload
  return ctx.confirm(canLeave)
}


const callHistory = ({ action, history, routes, options, hasMiddleware }) => {
  const env = process.env.NODE_ENV

  if (env === 'development' && !hasMiddleware('pathlessRouteThunk')) {
    throw new Error('[rudy] "pathlessRouteThunk" middleware is required to use history action creators.')
  }

  const { method, args } = action.payload

  if (method !== 'reset') {
    return history[method](...args, false)
  }

  const [entries, index, kind] = args

  if (typeof entries[0] === 'object' && entries[0].type) {
    const locations = entries.map(action => {
      const url = actionToUrl(action, routes, options)
      return createLocation(url, action.state, undefined, undefined, action.basename)
    })

    return history.reset(locations, index, kind, false)
  }

  return history.reset(entries, index, kind, false)
}
