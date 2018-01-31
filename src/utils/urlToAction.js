// @flow
import qs from 'query-string'
import { matchUrl } from './index'
import { parsePath } from '../history/utils'
import { notFound } from '../actions'
import { NOT_FOUND } from '../types'

import type { RoutesMap, ReceivedAction, Route, Options } from '../flow-types'

export default (
  loc: Object | string,
  routes: RoutesMap,
  options: Options
): ReceivedAction => {
  const { url, state } = typeof loc === 'string' ? { url: loc } : loc
  const types = Object.keys(routes).filter(type => routes[type].path)
  const l = parsePath(url)

  for (let i = 0; i < types.length; i++) {
    const type = types[i]
    const route = routes[type]
    const match = matchUrl(l, route, transformers, route, options)

    if (match) {
      const { params, query, hash } = match
      return { type, params, query, hash, state }
    }
  }

  // This will basically only end up being called if the developer is manually calling history.push().
  // Or, if visitors visit an invalid URL, the developer can use the NOT_FOUND type to show a not-found page to
  const { search, hash } = l
  const params = {}
  const query = search
    ? (routes[NOT_FOUND].parseQuery || options.parseQuery || qs.parse)(search)
    : {}

  return notFound({ params, query, hash, state }, url)
}

const fromParams = (params: Object, route: Route, options: Options) => {
  const from = route.fromParam || (route.capitalizedWords && defaultFromParam) ||
    (route.convertNumbers && defaultFromParam) || options.fromParam || defaultFromParam

  for (const key in params) {
    const val = params[key]
    const decodedVal = decodeURIComponent(val)
    params[key] = from(decodedVal, key, route, val, options)
  }

  const def = route.defaultParams || options.defaultParams
  return def
    ? typeof def === 'function' ? def(params, route) : { ...def, params }
    : params
}

const defaultFromParam = (
  decodedVal: string,
  key: string,
  route: Route,
  val: string,
  options: Options
) => {
  const convert = route.convertNumbers || options.convertNumbers

  if (convert && isNumber(decodedVal)) {
    return parseFloat(decodedVal)
  }

  const capitalize = route.capitalizedWords || options.capitalizedWords

  if (capitalize) {
    return decodedVal.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) // 'my-category' -> 'My Category'
  }

  return decodedVal
}

const fromQuery = (query: Object, route: Route, options: Options) => {
  const from = route.fromQuery || options.fromQuery

  if (from) {
    for (const key in query) {
      query[key] = from(query[key], key, route)
    }
  }

  const def = route.defaultQuery || options.defaultQuery
  return def
    ? typeof def === 'function' ? def(query, route) : { ...def, query }
    : query
}

const fromHash = (hash: string, route: Route, options: Options) => {
  const from = route.fromHash || options.fromHash
  hash = from ? from(hash, route) : hash

  const def = route.defaultHash || options.defaultHash
  return def
    ? typeof def === 'function' ? def(hash, route) : (hash || def)
    : hash
}

const transformers = { fromParams, fromQuery, fromHash }

const isNumber = (val: string) => !val.match(/^\s*$/) && !isNaN(val)
