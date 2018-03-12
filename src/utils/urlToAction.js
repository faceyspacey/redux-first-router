// @flow
import qs from 'query-string'
import { matchUrl } from './index'
import { parsePath } from '../history/utils'
import { notFound } from '../actions'

import type { RoutesMap, ReceivedAction, Route, Options } from '../flow-types'

export default (
  loc: Object | string,
  routes: RoutesMap,
  opts: Options
): ReceivedAction => {
  const { url, state, basename } = typeof loc === 'string' ? { url: loc } : loc
  const types = Object.keys(routes).filter(type => routes[type].path)
  const path = url.replace(basename, '')
  const l = parsePath(path)

  for (let i = 0; i < types.length; i++) {
    const type = types[i]
    const route = routes[type]
    const match = matchUrl(l, route, transformers, route, opts)

    if (match) {
      const { params, query, hash } = match
      const st = fromState(state, route, opts)
      return { type, params, query, hash, basename, state: st }
    }
  }

  // This will basically only end up being called if the developer is manually calling history.push().
  // Or, if visitors visit an invalid URL, the developer can use the NOT_FOUND type to show a not-found page to
  const { search, hash } = l
  const params = {}
  const query = search
    ? (routes.NOT_FOUND.parseQuery || opts.parseQuery || qs.parse)(search)
    : {}

  return notFound({ params, query, hash, state, basename }, url)
}

const fromParams = (params: Object, route: Route, opts: Options) => {
  const from = route.fromParam || defaultFromParam

  for (const key in params) {
    const val = params[key]
    const decodedVal = val && decodeURIComponent(val) // don't decode undefined values from optional params
    params[key] = from(decodedVal, key, val, route, opts)
    if (params[key] === undefined) delete params[key] === undefined // allow optional params to be overriden by defaultParams
  }

  const def = route.defaultParams || opts.defaultParams
  return def
    ? (typeof def === 'function' ? def(params, route, opts) : { ...def, ...params })
    : params
}

const defaultFromParam = (
  decodedVal: string,
  key: string,
  val: string,
  route: Route,
  opts: Options
) => {
  const convertNum = route.convertNumbers ||
    (opts.convertNumbers && route.convertNumbers !== false)

  if (convertNum && isNumber(decodedVal)) {
    return parseFloat(decodedVal)
  }

  const capitalize = route.capitalizedWords ||
    (opts.capitalizedWords && route.capitalizedWords !== false)

  if (capitalize) {
    return decodedVal.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) // 'my-category' -> 'My Category'
  }

  return opts.fromParam
    ? opts.fromParam(decodedVal, key, val, route, opts)
    : decodedVal
}

const fromQuery = (query: Object, route: Route, opts: Options) => {
  const from = route.fromQuery || opts.fromQuery

  if (from) {
    for (const key in query) {
      query[key] = from(query[key], key, route, opts)
      if (query[key] === undefined) delete query[key] === undefined // allow undefined values to be overriden by defaultQuery
    }
  }

  const def = route.defaultQuery || opts.defaultQuery
  return def
    ? typeof def === 'function' ? def(query, route, opts) : { ...def, ...query }
    : query
}

const fromHash = (hash: string, route: Route, opts: Options) => {
  const from = route.fromHash || opts.fromHash
  hash = from ? from(hash, route, opts) : hash

  const def = route.defaultHash || opts.defaultHash
  return def
    ? typeof def === 'function' ? def(hash, route, opts) : (hash || def)
    : hash
}

const fromState = (state: Object, route: Route, opts: Options) => {
  const from = route.fromState || opts.fromState

  if (from) {
    for (const key in state) {
      state[key] = from(state[key], key, route, opts)
      if (state[key] === undefined) delete state[key] === undefined // allow undefined values to be overriden by defaultQuery
    }
  }

  const def = route.defaultState || opts.defaultState
  return def
    ? typeof def === 'function' ? def(state, route, opts) : { ...def, ...state }
    : state
}

const transformers = { fromParams, fromQuery, fromHash }

const isNumber = (val: string) => /^\d+$/.test(val)
