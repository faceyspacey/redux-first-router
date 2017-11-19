// @flow
import { compileParamsToPath } from 'rudy-match-path'
import type {
  Route,
  Payload,
  Params,
  RoutesMap,
  ReceivedAction as Action,
  QuerySerializer
} from '../flow-types'

export default (
  action: Action,
  routes: RoutesMap,
  serializer?: QuerySerializer
): string => {
  const route = routes[action.type]
  const routePath = typeof route === 'object' ? route.path : route
  const params = _payloadToParams(route, action.payload)

  if (typeof routePath !== 'string') {
    throw new Error('[rudy] invalid route path')
  }

  const path = compileParamsToPath(routePath, params) || '/'
  const query = action.query
  const hash = action.hash ? `#${action.hash}` : ''

  let search = query && serializer && serializer.stringify(query)
  search = search ? `?${search}` : ''

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
