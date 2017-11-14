// @flow
import { NOT_FOUND } from '../index'
import type { RoutesMap, RoutesMapInput } from '../flow-types'

export default (routes: RoutesMapInput): RoutesMap => {
  routes[NOT_FOUND] = routes[NOT_FOUND] || {}

  for (const type in routes) {
    const route = routes[type]

    if (typeof route === 'function') routes[type] = { thunk: route }
    else if (typeof route === 'string') routes[type] = { path: route }

    routes[type].type = type
  }

  routes[NOT_FOUND].path = routes[NOT_FOUND].path || '/not-found'

  return routes
}


