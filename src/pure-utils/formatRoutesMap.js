// @flow
import { NOT_FOUND } from '../index'
import type { RoutesMapInput, RoutesMap } from '../flow-types'

export default (routesMapInput: RoutesMapInput): RoutesMap => {
  routesMapInput[NOT_FOUND] = routesMapInput[NOT_FOUND] || {}

  return Object.keys(routesMapInput)
    .reduce((routesMap, type) => {
      const path = routesMap[type]
      routesMap[type] = typeof path === 'string' ? { path } : path
      return routesMap
    }, routesMapInput)
}
