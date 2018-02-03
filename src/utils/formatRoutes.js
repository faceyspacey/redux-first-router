// @flow
import { NOT_FOUND } from '../types'
import { redirect } from '../actions'
import type { RoutesMap, RoutesMapInput } from '../flow-types'

export default (
  routes: RoutesMapInput,
  formatRoute: ?Function,
  isAddRoutes: boolean = false
): RoutesMap => {
  if (!isAddRoutes) routes[NOT_FOUND] = routes[NOT_FOUND] || {}

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
