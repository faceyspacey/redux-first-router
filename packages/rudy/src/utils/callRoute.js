// @flow
import type { Action, Routes } from '../flow-types'

export default (routes: Routes) => (
  action: Action | string | Object,
  key?: string,
  ...args: Array<any>
) => {
  const type: string = typeof action === 'string' ? action : action.type
  const route = routes[type]
  if (!route) return null

  if (!key) return route
  if (typeof route[key] !== 'function') return route[key]

  action = typeof action === 'object' ? action : { type }
  return route[key](action, ...args)
}

// usage:
// callRoute(routes)(action, key, ...args)
