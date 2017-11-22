// @flow
import qs from 'query-string'
import { compileParamsToPath } from './matchPath'
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
  const route = routes[action.type]
  const p = typeof route === 'object' ? route.path : route
  const params = _payloadToParams(route, action.payload)

  if (typeof p !== 'string') throw new Error('[rudy] invalid route path')

  const path = compileParamsToPath(p, params) || '/'
  const search = action.query ? `?${qs.stringify(action.query)}` : ''
  const hash = action.hash ? `#${action.hash}` : ''

  return `${path}${search}${hash}`
}

const _payloadToParams = (route: Route, params: Payload = {}): Params =>
  Object.keys(params).reduce((sluggifedParams, key) => {
    const segment = params[key]
    sluggifedParams[key] = transformSegment(segment, route, key)
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
