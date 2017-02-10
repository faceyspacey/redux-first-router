// @flow
import pathToRegexp from 'path-to-regexp'
import type {
  RouteObject,
  Payload,
  Params,
  RoutesMap,
  PlainAction as Action,
} from '../flow-types'


export default (action: Action, routesMap: RoutesMap): string => {
  const route = routesMap[action.type]
  const path = typeof route === 'object' ? route.path : route
  const params = typeof route === 'object' ? _payloadToParams(route, action.payload) : action.payload

  return pathToRegexp.compile(path)(params || {})
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
