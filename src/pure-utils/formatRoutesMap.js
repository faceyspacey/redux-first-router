// @flow
import { NOT_FOUND } from '../index'
import type { RoutesMapInput, RoutesMap } from '../flow-types'

export default (routesMapInput: RoutesMapInput): RoutesMap => {
  routesMapInput[NOT_FOUND] = routesMapInput[NOT_FOUND] || {}
  routesMapInput[NOT_FOUND].path = routesMapInput[NOT_FOUND].path || '/not-found'

  return Object.keys(routesMapInput)
    .reduce((routesMap, type) => {
      const route = routesMap[type]

      if (typeof route === 'function') routesMap[type] = { thunk: route }
      else if (typeof route === 'string') routesMap[type] = { path: route }

      return routesMap
    }, routesMapInput)
}
