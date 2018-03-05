// @flow
import type { Action, RoutesMap } from '../flow-types'

export default (routes: RoutesMap) => (
  action: Action | string,
  key?: string,
  ...args: Array<any>
) => {
  const type = typeof action === 'string' ? action : action.type
  const route = routes[type]
  if (!route) return null

  if (!key) return route
  if (typeof route[key] !== 'function') return route[key]

  action = typeof action === 'object' ? action : { type }
  return route[key](action, ...args)
}

// usage:
// callRoute(routes)(action, key, ...args)
