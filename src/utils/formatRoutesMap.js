// @flow
import { NOT_FOUND } from '../types'
import { redirect } from '../actions'
import type { RoutesMap, RoutesMapInput } from '../flow-types'

export default (routes: RoutesMapInput, isAddRoutes: boolean = false): RoutesMap => {
  if (!isAddRoutes) routes[NOT_FOUND] = routes[NOT_FOUND] || {}

  for (const type in routes) {
    let route = routes[type]

    if (typeof route === 'function') routes[type] = { thunk: route }
    else if (typeof route === 'string') routes[type] = { path: route }

    route = routes[type]
    route.type = type
    if (route.redirect) createRedirect(route, routes)
  }

  if (!isAddRoutes) routes[NOT_FOUND].path = routes[NOT_FOUND].path || '/not-found'

  return routes
}

const createRedirect = (route, routes) => {
  const t = route.redirect
  const scenicType = `${route.scene}/${t}`
  const type = routes[scenicType] ? scenicType : t

  route.beforeEnter = ({ action }) => redirect({ ...action, type }, 301)
}
