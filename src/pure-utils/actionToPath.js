// @flow
import pathToRegexp from 'path-to-regexp'
import type {
  RouteObject,
  Payload,
  Params,
  RoutesMap,
  ReceivedAction as Action,
  QuerySerializer
} from '../flow-types'

export default (
  action: Action,
  routesMap: RoutesMap,
  serializer?: QuerySerializer
): string => {
  const route = routesMap[action.type]
  const routePath = typeof route === 'object' ? route.path : route
  const params = typeof route === 'object'
    ? _payloadToParams(route, action.payload)
    : action.payload

  const path = pathToRegexp.compile(routePath)(params || {}) || '/'

  const query =
    action.query ||
    (action.meta && action.meta.query) ||
    (action.payload && action.payload.query)

  const search = query && serializer && serializer.stringify(query)

  return search ? `${path}?${search}` : path
}

const _payloadToParams = (route: RouteObject, params: Payload = {}): Params =>
  Object.keys(params).reduce((sluggifedParams, key) => {
    if (typeof params[key] !== 'undefined') {
      if (typeof params[key] === 'number') {
        sluggifedParams[key] = params[key]
      }
      else if (route.capitalizedWords === true) {
        sluggifedParams[key] = params[key].replace(/ /g, '-').toLowerCase()
      }
      else if (typeof route.toPath === 'function') {
        sluggifedParams[key] = route.toPath(params[key], key)
      }
      else if (typeof params[key] === 'string') {
        sluggifedParams[key] = params[key]
      }
    }

    return sluggifedParams
  }, {})
