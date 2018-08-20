// @flow
import { compileUrl, cleanBasename } from './index'

import type {
  Route,
  Routes,
  ReceivedAction as Action,
  Options,
} from '../flow-types'

export default (action: Action, api: Object, prevRoute?: string): Object => {
  const { routes, options: opts }: Object = api
  const { type, params, query, state, hash, basename }: Action = action

  const route = routes[type] || {}
  const path: string | void | string | void =
    typeof route === 'object' ? route.path : route

  const p: void | {} = formatParams(params, route, opts)
  const q: mixed = formatQuery(query, route, opts)
  const s: ?Object = formatState(state, route, opts)
  const h: string = formatHash(hash, route, opts)

  const bn = cleanBasename(basename)
  const isWrongBasename = bn && !opts.basenames.includes(bn)
  // $FlowFixMe
  if (basename === '') s._emptyBn = true // not cool kyle

  try {
    if (isWrongBasename) {
      throw new Error(`[rudy] basename "${bn}" not in options.basenames`)
    }

    const pathname: string = compileUrl(path, p, q, h, route, opts) || '/' // path-to-regexp throws for failed compilations; we made our queries + hashes also throw to conform
    const url: string = bn + pathname

    return { url, state: s }
  } catch (e) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error(
        `[rudy] unable to compile action "${type}" to URL`,
        action,
        e,
      )
    } else if (process.env.NODE_ENV === 'test') {
      // eslint-disable-next-line no-console
      console.log(`[rudy] unable to compile action "${type}" to URL`, action, e)
    }

    const base: string = isWrongBasename ? '' : bn
    const url: string =
      base + notFoundUrl(action, routes, opts, q, h, prevRoute)
    return { url, state: s }
  }
}

const formatParams = (
  params: ?Object,
  route: Route,
  opts: Options,
): void | {} => {
  const def: mixed = route.defaultParams || opts.defaultParams

  params = def
    ? typeof def === 'function'
      ? def(params, route, opts)
      : { ...def, ...params }
    : params

  if (params) {
    const newParams: {} = {}
    const to = route.toPath || defaultToPath
    Object.keys(params).forEach((key: string) => {
      const val = params[key]
      const encodedVal: string = encodeURIComponent(val)

      const res = to(val, key, encodedVal, route, opts)
      newParams[key] = res
    })
    return newParams
  }
  return undefined
}

const defaultToPath = (
  val: (string) => Array<Array<any>>,
  key: string,
  encodedVal: string,
  route: Route,
  opts: Options,
): string | void => {
  if (typeof val === 'string' && val.indexOf('/') > -1) {
    // support a parameter that for example is a file path with slashes (like on github)
    return val.split('/').map(encodeURIComponent) // path-to-regexp supports arrays for this use case
  }

  if (typeof val === 'string' && val.indexOf('/') > -1) {
    // support a parameter that for example is a file path with slashes (like on github)
    return val.split('/').map(encodeURIComponent) // path-to-regexp supports arrays for this use case
  }

  const capitalize =
    route.capitalizedWords ||
    (opts.capitalizedWords && route.capitalizedWords !== false)

  if (capitalize && typeof val === 'string') {
    return val.replace(/ /g, '-').toLowerCase()
  }
  return opts.toPath
    ? opts.toPath(val, key, encodedVal, route, opts)
    : val === undefined
      ? undefined
      : encodedVal
}

const formatQuery = (query: ?Object, route: Route, opts: Options): mixed => {
  const def = route.defaultQuery || opts.defaultQuery
  query = def
    ? typeof def === 'function'
      ? def(query, route, opts)
      : { ...def, ...query }
    : query

  const to = route.toSearch || opts.toSearch

  if (to && query) {
    const newQuery = {}

    Object.keys(query).forEach((key) => {
      newQuery[key] = to(query[key], key, route, opts)
    })

    return newQuery
  }

  return query
}

const formatHash = (hash: string = '', route: Route, opts: Options): string => {
  const def: string | void | Function | string =
    route.defaultHash || opts.defaultHash
  hash = def
    ? typeof def === 'function'
      ? def(hash, route, opts)
      : hash || def
    : hash
  const to = route.toHash || opts.toHash
  return to ? to(hash, route, opts) : hash
}

const formatState = (
  state: ?Object = {},
  route: Route,
  opts: Options,
): ?Object => {
  const def: mixed = route.defaultState || opts.defaultState
  return def
    ? typeof def === 'function'
      ? def(state, route, opts)
      : { ...def, ...state }
    : state
} // state has no string counter part in the address bar, so there is no `toState`

const notFoundUrl = (
  action: Action,
  routes: Routes,
  opts: Options,
  query: mixed,
  hash: string,
  prevRoute: string = '',
): string => {
  const type: string = action.type || ''
  const route: {} = routes[type] || {}
  const hasScene: boolean = type.indexOf('/NOT_FOUND') > -1
  // TODO: Look into scene stuff
  // $FlowFixMe
  const scene: string = route.scene || prevRoute.scene || ''
  const t: string = hasScene
    ? type
    : routes[`${scene}/NOT_FOUND`] // try to interpret scene-level NOT_FOUND if available (note: links create plain NOT_FOUND actions)
      ? `${scene}/NOT_FOUND`
      : 'NOT_FOUND'

  const p: string = routes[t].path || routes.NOT_FOUND.path || ''
  // $FlowFixMe
  const s: string = query
    ? opts.stringifyQuery(query, { addQueryPrefix: true })
    : '' // preserve these (why? because we can)
  const h: string = hash ? `#${hash}` : ''

  return p + s + h
}
