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
  api: Object,
  prevRoute?: Object
): string => {
  const { routes, options: opts } = api
  const { type, params, query, hash, basename: bn = '' } = action
  const route = routes[type]
  const path = typeof route === 'object' ? route.path : route
  const state = toState(action.state, route, opts)
  const basename = bn && bn.charAt(0) !== '/' ? `/${bn}` : bn
  const isWrongBasename = basename && !opts.basenames.includes(basename)

  try {
    if (isWrongBasename) {
      throw new Error(`[rudy] basename "${basename}" not in options.basenames`)
    }

    const pathname = compileUrl(
      path,
      toPath(params, route, opts),
      toSearch(query, route, opts),
      toHash(hash, route, opts),
      route,
      opts
    ) || '/'

    const url = basename + pathname
    return { url, state }
  }
  catch (e) {
    if (process.env.NODE_ENV === 'test') {
      console.log(`[rudy] unable to compile action "${type}" to URL`, action, e)
    }

    const bn = isWrongBasename ? '' : basename
    const url = bn + notFoundUrl(action, routes, prevRoute)
    return { url, state: {} }
  }
}

const toPath = (params: ?Object, route: Route, opts: Options) => {
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

const toSearch = (query: ?Object, route: Route, opts: Options) => {
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

const toState = (state: ?Object, route: Route, opts: Options) => {
  const def = route.defaultState || opts.defaultState
  return def
    ? typeof def === 'function' ? def(state, route, opts) : { ...def, ...state }
    : state
}

const toHash = (hash: ?string = '', route: Route, opts: Options) => {
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
  const type = hasScene
    ? action.type
    : routes[`${scene}/NOT_FOUND`] // try to interpret scene-level NOT_FOUND if available (note: links create plain NOT_FOUND actions)
      ? `${scene}/NOT_FOUND`
      : 'NOT_FOUND'

  return routes[type].path || routes.NOT_FOUND.path
}
