// @flow
import { compileUrl } from './index'
import { matchQuery, matchVal } from './matchUrl'

import type {
  Route,
  Payload,
  Params,
  RoutesMap,
  ReceivedAction as Action,
  Options
} from '../flow-types'

export default (
  action: Action,
  routes: RoutesMap,
  options: Options = {}
): string => {
  const { type, params, query, hash } = action
  const route = routes[type]
  const path = typeof route === 'object' ? route.path : route

  if (typeof path !== 'string') throw new Error('[rudy] invalid route path')

  return compileUrl(
    path,
    toParams(params, route, options),
    toQuery(query, route, options),
    toHash(hash, route, options),
    route,
    options
  ) || '/'
}

const toParams = (params: Object, route: Route, options: Options) => {
  const def = route.defaultParams || options.defaultParams
  params = def
    ? typeof def === 'function' ? def(params, route) : { ...def, params }
    : params

  const to = route.toParam || (route.capitalizedWords && defaultToParam) ||
    options.toParam || defaultToParam

  const newParams = {}

  for (const key in params) {
    const val = params[key]
    const encodedVal = encodeURIComponent(val)
    newParams[key] = to(val, key, route, encodedVal, options)
  }

  return newParams
}

const defaultToParam = (
  val: string,
  key: string,
  route: Route,
  encodedVal: string,
  options: Options
) => {
  if (typeof val === 'number') return String(val)

  if (encodedVal.indexOf('/') > -1) { // support a parameter that for example is a file path with slashes (like on github)
    return encodedVal.split('/') // path-to-regexp supports arrays for this use case
  }

  if (route.capitalizedWords === true) {
    return val.replace(/ /g, '-').toLowerCase()
  }

  return encodedVal
}

const toQuery = (query: ?Object, route: Route, options: Options) => {
  const def = route.defaultQuery || options.defaultQuery
  query = def
    ? typeof def === 'function' ? def(query, route) : { ...def, query }
    : query

  const to = route.toQuery || options.toQuery

  if (to && query) {
    for (const key in query) {
      query[key] = to(query[key], key, route)
    }
  }

  return query
}

const toHash = (hash: ?string, route: Route, options: Options) => {
  const def = route.defaultHash || options.defaultHash
  hash = def
    ? typeof def === 'function' ? def(hash, route) : (hash || def)
    : hash

  const to = route.toHash || options.toHash
  return to ? to(hash, route) : hash
}
