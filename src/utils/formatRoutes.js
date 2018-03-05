// @flow
import { ADD_ROUTES, CHANGE_BASENAME, CLEAR_CACHE, CONFIRM, CALL_HISTORY } from '../types'
import type { RoutesMap, RoutesMapInput } from '../flow-types'

import {
  addRoutes,
  changeBasename,
  clearCache,
  confirm,
  callHistory
} from '../pathlessRoutes'

export default (
  routes: RoutesMapInput,
  formatRoute: ?Function,
  isAddRoutes: boolean = false
): RoutesMap => {
  if (!isAddRoutes) {
    routes.NOT_FOUND = routes.NOT_FOUND || { path: '/not-found' }
  }

  routes[ADD_ROUTES] = routes[ADD_ROUTES] || { thunk: addRoutes }
  routes[CHANGE_BASENAME] = routes[CHANGE_BASENAME] || { thunk: changeBasename, dispatch: false }
  routes[CLEAR_CACHE] = routes[CLEAR_CACHE] || { thunk: clearCache }
  routes[CONFIRM] = routes[CONFIRM] || { thunk: confirm, dispatch: false }
  routes[CALL_HISTORY] = routes[CALL_HISTORY] || { thunk: callHistory, dispatch: false }

  const types = Object.keys(routes)

  types.forEach(type => {
    const route = format(routes[type], type, routes, formatRoute, isAddRoutes)
    route.type = type
    routes[type] = route
  })

  return routes
}

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

