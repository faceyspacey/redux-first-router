// @flow
import { compileUrl } from './index'

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
  opts: Options = {},
  prevRoute?: Object
): string => {
  const { type, params, query, hash, basename = '' } = action
  const route = routes[type]
  const path = typeof route === 'object' ? route.path : route

  if (typeof path !== 'string') throw new Error('[rudy] invalid route path')

  const state = toState(action.state, route, opts, action)

  try {
    const pathname = compileUrl(
      path,
      toPath(params, route, opts, action),
      toSearch(query, route, opts, action),
      toHash(hash, route, opts, action),
      route,
      opts
    ) || '/'

    const url = basename + pathname
    return { url, state }
  }
  catch (e) {
    if (process.env.NODE_ENV === 'development') {
      console.error(`[rudy] unable to compile action "${type}" to URL`, action, e)
    }

    const url = basename + notFoundUrl(action, routes, prevRoute)
    return { url, state: {} }
  }
}

const toPath = (params: ?Object, route: Route, opts: Options, action) => {
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

const toSearch = (query: ?Object, route: Route, opts: Options, action) => {
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

const toState = (state: ?Object, route: Route, opts: Options, action) => {
  const def = route.defaultState || opts.defaultState
  return def
    ? typeof def === 'function' ? def(state, route, opts) : { ...def, ...state }
    : state
}

const toHash = (hash: ?string = '', route: Route, opts: Options, action) => {
  const def = route.defaultHash || opts.defaultHash
  hash = def
    ? typeof def === 'function' ? def(hash, route, opts) : (hash || def)
    : hash

  const to = route.toHash || opts.toHash
  return to ? to(hash, route, opts) : hash
}

const notFoundUrl = (action, routes, prevRoute: Object = {}) => {
  const route = routes[action.type] || {}
  const hasScene = action.type.indexOf('/NOT_FOUND') > -1
  const scene = route.scene || prevRoute.scene || ''

  action.type = hasScene
    ? action.type
    : routes[`${scene}/NOT_FOUND`] // try to interpret scene-level NOT_FOUND if available (note: links create plain NOT_FOUND actions)
      ? `${scene}/NOT_FOUND`
      : 'NOT_FOUND'

  return routes[action.type].path || routes.NOT_FOUND.path
}
