// @flow
import { compileUrl } from './index'
import type {
  Route,
  Payload,
  Params,
  RoutesMap,
  ReceivedAction as Action
} from '../flow-types'

export default (
  action: Action,
  routes: RoutesMap
): string => {
  const { type, payload, query, hash } = action
  const route = routes[type]
  const p = typeof route === 'object' ? route.path : route
  const params = _payloadToParams(route, payload)

  if (typeof p !== 'string') throw new Error('[rudy] invalid route path')

  return compileUrl(p, params, query, hash) || '/'
}

const _payloadToParams = (route: Route, params: Payload = {}): Params =>
  Object.keys(params).reduce((sluggifedParams, key) => {
    sluggifedParams[key] = transformSegment(params[key], route, key)
    return sluggifedParams
  }, {})

const transformSegment = (segment: string, route: Route, key: string) => {
  if (typeof route.toPath === 'function') {
    return route.toPath(segment, key)
  }
  else if (typeof segment === 'string') {
    if (segment.indexOf('/') > -1) {
      return segment.split('/')
    }

    if (route.capitalizedWords === true) {
      return segment.replace(/ /g, '-').toLowerCase()
    }

    return segment
  }
  else if (typeof segment === 'number') {
    return segment
  }
}
