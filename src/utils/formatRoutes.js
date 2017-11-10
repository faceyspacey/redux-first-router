// @flow
import { NOT_FOUND } from '../index'
import type { RoutesMap, RoutesMapInput } from '../flow-types'

export default (routes: RoutesMapInput): RoutesMap => {
  routes[NOT_FOUND] = routes[NOT_FOUND] || {}
  routes[NOT_FOUND].path = routes[NOT_FOUND].path || '/not-found'

  return Object.keys(routes)
    .reduce((routes, type) => {
      const route = routes[type]

      if (typeof route === 'function') routes[type] = { thunk: route }
      else if (typeof route === 'string') routes[type] = { path: route }

      return routes
    }, routes)
}
