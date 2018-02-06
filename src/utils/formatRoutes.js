// @flow
import { NOT_FOUND, ADD_ROUTES, CALL_HISTORY } from '../types'
import { redirect } from '../actions'
import type { RoutesMap, RoutesMapInput } from '../flow-types'
import { enhanceRoutes } from '../middleware/call/utils' // unfortunate coupling (to potentially optional middleware)
import { callHistoryThunk } from '../actions/history'

const formatRoutes = (
  routes: RoutesMapInput,
  formatRoute: ?Function,
  isAddRoutes: boolean = false
): RoutesMap => {
  if (!isAddRoutes) routes[NOT_FOUND] = routes[NOT_FOUND] || {}

  routes[ADD_ROUTES] = routes[ADD_ROUTES] || { thunk: addRoutesThunk }
  routes[CALL_HISTORY] = routes[CALL_HISTORY] || { thunk: callHistoryThunk }

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
  else if (typeof route === 'function') {
    return { thunk: route }
  }

  return route
}

const createRedirect = (route, routes) => {
  const t = route.redirect
  const scenicType = `${route.scene}/${t}`
  const type = routes[scenicType] ? scenicType : t

  route.beforeEnter = ({ action }) => redirect({ ...action, type }, 301)
}

const addRoutesThunk = ({ action, options, routes: allRoutes }) => {
  const { routes, formatRoute } = action.payload
  const format = formatRoute || options.formatRoute
  const newRoutes = formatRoutes(routes, format, true)

  const callbacks = options.callbacks || []

  callbacks.forEach(name => {
    enhanceRoutes(name, newRoutes)
  })

  Object.assign(allRoutes, newRoutes)
}

