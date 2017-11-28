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
  const { type, params: p, query, hash } = action
  const route = routes[type]
  const path = typeof route === 'object' ? route.path : route
  const params = transformParams(route, p)

  if (typeof path !== 'string') throw new Error('[rudy] invalid route path')

  return compileUrl(path, params, query, hash) || '/'
}

const transformParams = (route: Route, params: Payload = {}): Params =>
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
