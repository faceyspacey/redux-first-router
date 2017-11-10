// @flow
import type { Action, RoutesMap } from '../flow-types'

export default (routes: RoutesMap) => (
  action: Action,
  name: string,
  ...args: Array<any>
) => {
  const route = routes[action.type]
  if (!route) return null

  if (!name) return route
  if (typeof route[name] !== 'function') return route[name]
  return route[name](action, ...args)
}

// usage:
// callRoute(routes)(action, name)
