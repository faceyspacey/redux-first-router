// @flow
import { NOT_FOUND } from '../index'
import type { RoutesMap, RoutesMapInput } from '../flow-types'
import redirect from '../action-creators/redirect'

export default (routes: RoutesMapInput, isMore): RoutesMap => {
  if (!isMore) routes[NOT_FOUND] = routes[NOT_FOUND] || {}

  for (const type in routes) {
    let route = routes[type]

    if (typeof route === 'function') routes[type] = { thunk: route }
    else if (typeof route === 'string') routes[type] = { path: route }

    route = routes[type]
    route.type = type
    if (route.redirect) createRedirect(route, routes)
  }

  if (!isMore) routes[NOT_FOUND].path = routes[NOT_FOUND].path || '/not-found'

  return routes
}

const createRedirect = (route, routes) => {
  const t = route.redirect
  const scenicType = `${route.scene}/${t}`
  const type = routes[scenicType] ? scenicType : t

  route.beforeEnter = ({ action }) => redirect({ ...action, type }, 301)
}
