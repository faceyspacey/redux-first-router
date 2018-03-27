// @flow
import { compileUrl, cleanBasename } from './index'

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
  api: Object,
  prevRoute?: Object
): string => {
  const { routes, options: opts } = api
  const { type, params, query, state, hash, basename } = action

  const route = routes[type]
  const path = typeof route === 'object' ? route.path : route

  const p = formatParams(params, route, opts)
  const q = formatQuery(query, route, opts)
  const s = formatState(state, route, opts)
  const h = formatHash(hash, route, opts)

  const bn = cleanBasename(basename)
  const isWrongBasename = bn && !opts.basenames.includes(bn)
  if (basename === '') s._emptyBn = true // not cool kyle

  try {
    if (isWrongBasename) {
      throw new Error(`[rudy] basename "${bn}" not in options.basenames`)
    }

    const pathname = compileUrl(path, p, q, h, route, opts) || '/' // path-to-regexp throws for failed compilations; we made our queries + hashes also throw to conform
    const url = bn + pathname

    return { url, state: s }
  }
  catch (e) {
    if (process.env.NODE_ENV === 'development') {
      console.error(`[rudy] unable to compile action "${type}" to URL`, action, e)
    }
    else if (process.env.NODE_ENV === 'test') {
      console.log(`[rudy] unable to compile action "${type}" to URL`, action, e)
    }

    const base = isWrongBasename ? '' : bn
    const url = base + notFoundUrl(action, routes, opts, q, h, prevRoute)
    return { url, state: s }
  }
}

const formatParams = (params: ?Object, route: Route, opts: Options) => {
  const def = route.defaultParams || opts.defaultParams
  params = def
    ? typeof def === 'function' ? def(params, route, opts) : { ...def, ...params }
    : params

  if (params) {
    const newParams = {}
    const to = route.toPath || defaultToPath

    for (const key in params) {
      const val = params[key]
      const encodedVal = encodeURIComponent(val)
      const res = to(val, key, encodedVal, route, opts)
      newParams[key] = res
    }

    return newParams
  }
}

const defaultToPath = (
  val: string,
  key: string,
  encodedVal: string,
  route: Route,
  opts: Options
) => {
  if (typeof val === 'string' && val.indexOf('/') > -1) { // support a parameter that for example is a file path with slashes (like on github)
    return val.split('/').map(encodeURIComponent) // path-to-regexp supports arrays for this use case
  }

  const capitalize = route.capitalizedWords ||
    (opts.capitalizedWords && route.capitalizedWords !== false)

  if (capitalize && typeof val === 'string') {
    return val.replace(/ /g, '-').toLowerCase()
  }

  return opts.toPath
    ? opts.toPath(val, key, encodedVal, route, opts)
    : val === undefined ? undefined : encodedVal
}

const formatQuery = (query: ?Object, route: Route, opts: Options) => {
  const def = route.defaultQuery || opts.defaultQuery
  query = def
    ? typeof def === 'function' ? def(query, route, opts) : { ...def, ...query }
    : query

  const to = route.toSearch || opts.toSearch

  if (to && query) {
    const newQuery = {}

    for (const key in query) {
      newQuery[key] = to(query[key], key, route, opts)
    }

    return newQuery
  }

  return query
}

const formatHash = (hash: string = '', route: Route, opts: Options) => {
  const def = route.defaultHash || opts.defaultHash
  hash = def
    ? typeof def === 'function' ? def(hash, route, opts) : (hash || def)
    : hash

  const to = route.toHash || opts.toHash
  return to ? to(hash, route, opts) : hash
}

const formatState = (state: ?Object = {}, route: Route, opts: Options) => {
  const def = route.defaultState || opts.defaultState
  return def
    ? typeof def === 'function' ? def(state, route, opts) : { ...def, ...state }
    : state
} // state has no string counter part in the address bar, so there is no `toState`

const notFoundUrl = (action, routes, opts: Options, query, hash, prevRoute: Object = {}) => {
  const route = routes[action.type] || {}
  const hasScene = action.type.indexOf('/NOT_FOUND') > -1
  const scene = route.scene || prevRoute.scene || ''
  const type = hasScene
    ? action.type
    : routes[`${scene}/NOT_FOUND`] // try to interpret scene-level NOT_FOUND if available (note: links create plain NOT_FOUND actions)
      ? `${scene}/NOT_FOUND`
      : 'NOT_FOUND'

  const p = routes[type].path || routes.NOT_FOUND.path
  const s = query ? opts.stringifyQuery(query, { addQueryPrefix: true }) : '' // preserve these (why? because we can)
  const h = hash ? `#${hash}` : ''

  return p + s + h
}
