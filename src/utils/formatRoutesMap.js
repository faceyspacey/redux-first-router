// @flow
import { NOT_FOUND } from '../index'
import type { RoutesMap, RoutesMapInput } from '../flow-types'

export default (routesMap: RoutesMapInput): RoutesMap => {
  routesMap[NOT_FOUND] = routesMap[NOT_FOUND] || {}
  routesMap[NOT_FOUND].path = routesMap[NOT_FOUND].path || '/not-found'

  return Object.keys(routesMap)
    .reduce((routesMap, type) => {
      const route = routesMap[type]

      if (typeof route === 'function') routesMap[type] = { thunk: route }
      else if (typeof route === 'string') routesMap[type] = { path: route }

      return routesMap
    }, routesMap)
}
