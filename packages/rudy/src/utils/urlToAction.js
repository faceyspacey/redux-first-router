// @flow
import resolvePathname from 'resolve-pathname'
import { urlToLocation, locationToUrl, cleanBasename, matchUrl } from './index'
import { notFound } from '../actions'
import type {
  Routes,
  HistoryLocation,
  NavigationAction,
  Route,
  Options,
} from '../flow-types'

export default (
  api: {
    routes: Routes,
    options: Options,
    getLocation: Function,
  },
  url: string,
  state: Object = {},
  key: string = createKey(),
) => {
  const { getLocation, routes, options: opts } = api
  const curr = getLocation ? getLocation() : {}

  const { basename, slashBasename } = resolveBasename(url, opts, state, curr)

  const location = createLocation(url, opts, slashBasename, curr)
  const action = createAction(location, routes, opts, state, curr)

  return {
    ...action, // { type, params, query, state, hash }
    basename,
    location: {
      key,
      scene: routes[action.type].scene || '',
      url: slashBasename + locationToUrl(location),
      pathname: location.pathname,
      search: location.search,
    },
  }
}

const createLocation = (url, opts, bn, curr) => {
  if (!url) {
    url = curr.pathname || '/'
  } else if (curr.pathname && url.charAt(0) !== '/') {
    url = resolvePathname(url, curr.pathname) // resolve pathname relative to current location
  } else {
    url = stripBasename(url, bn) // eg: /base/foo?a=b#bar -> /foo?a=b#bar
  }

  return urlToLocation(url) // gets us: { pathname, search, hash } properly formatted
}

const createAction = (
  loc: HistoryLocation,
  routes: Routes,
  opts: Options,
  st: Object = {},
  curr: Object = {},
): NavigationAction => {
  const types = Object.keys(routes).filter((type) => routes[type].path)

  for (let i = 0; i < types.length; i++) {
    const type = types[i]
    const route = routes[type]
    const transformers = { formatParams, formatQuery, formatHash }
    const match = matchUrl(loc, route, transformers, route, opts)

    if (match) {
      const { params, query, hash } = match
      const state = formatState(st, route, opts)
      return { type, params, query, hash, state }
    }
  }

  const { scene } = routes[curr.type] || {}

  // TODO: Need some clairfication on scene stuff
  // $FlowFixMe
  const type = routes[`${scene}/NOT_FOUND`] && `${scene}/NOT_FOUND` // try to interpret scene-level NOT_FOUND if available (note: links create plain NOT_FOUND actions)

  return {
    ...notFound(st, type),
    params: {}, // we can't know these in this case
    query: loc.search ? parseSearch(loc.search, routes, opts) : {}, // keep this info
    hash: loc.hash || '',
  }
}

// EVERYTHING BELOW IS RELATED TO THE TRANSFORMERS PASSED TO `matchUrl`:

const formatParams = (params: Object, route: Route, opts: Options) => {
  const from = route.fromPath || defaultFromPath

  Object.keys(params).forEach((key) => {
    const val = params[key]
    // don't decode undefined values from optional params
    const decodedVal = val && decodeURIComponent(val)
    params[key] = from(decodedVal, key, val, route, opts)
    if (params[key] === undefined) {
      // allow optional params to be overriden by defaultParams
      delete params[key]
    }
  })

  const def = route.defaultParams || opts.defaultParams
  return def
    ? typeof def === 'function'
      ? def(params, route, opts)
      : { ...def, ...params }
    : params
}

const defaultFromPath = (
  decodedVal: string,
  key: string,
  val: string,
  route: Route,
  opts: Options,
): string | number => {
  const convertNum =
    route.convertNumbers ||
    (opts.convertNumbers && route.convertNumbers !== false)

  if (convertNum && isNumber(decodedVal)) {
    return Number.parseFloat(decodedVal)
  }

  const capitalize =
    route.capitalizedWords ||
    (opts.capitalizedWords && route.capitalizedWords !== false)

  if (capitalize) {
    return decodedVal
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (ltr) => ltr.toUpperCase()) // 'my-category' -> 'My Category'
  }

  return opts.fromPath
    ? opts.fromPath(decodedVal, key, val, route, opts)
    : decodedVal
}

const formatQuery = (query: Object, route: Route, opts: Options) => {
  // TODO: Is this fromPath ? its got the same props going into it?
  // $FlowFixMe
  const from = route.fromSearch || opts.fromSearch

  if (from) {
    Object.keys(query).forEach((key) => {
      query[key] = from(query[key], key, route, opts)
      if (query[key] === undefined) {
        // allow undefined values to be overridden by defaultQuery
        delete query[key]
      }
    })
  }

  const def = route.defaultQuery || opts.defaultQuery
  return def
    ? typeof def === 'function'
      ? def(query, route, opts)
      : { ...def, ...query }
    : query
}

const formatHash = (hash: string, route: Route, opts: Options) => {
  // TODO: is this toHash?
  // $FlowFixMe
  const from = route.fromHash || opts.fromHash
  // $FlowFixMe
  hash = from ? from(hash, route, opts) : hash

  const def = route.defaultHash || opts.defaultHash
  return def
    ? typeof def === 'function'
      ? def(hash, route, opts)
      : hash || def
    : hash
}

const formatState = (state: Object, route: Route, opts: Options) => {
  const def = route.defaultState || opts.defaultState
  return def
    ? typeof def === 'function'
      ? def(state, route, opts)
      : { ...def, ...state }
    : state
} // state has no string counter part in the address bar, so there is no `fromState`

const isNumber = (str: string) => !Number.isNaN(Number.parseFloat(str))

const parseSearch = (search, routes, opts) =>
  (routes.NOT_FOUND.parseSearch || opts.parseSearch)(search)

// BASENAME HANDLING:

const resolveBasename = (url, opts, state, curr) => {
  // TODO: Whats going on with this huge option type?
  // $FlowFixMe
  const bn = state._emptyBn
    ? ''
    : findBasename(url, opts.basenames) || curr.basename

  const slashBasename = cleanBasename(bn)
  const basename = slashBasename.replace(/^\//, '') // eg: '/base' -> 'base'

  delete state._emptyBn // not cool kyle

  return { basename, slashBasename } // { 'base', '/base' }
}

export const stripBasename = (path: string, bn: string) =>
  path.indexOf(bn) === 0 ? path.substr(bn.length) : path

export const findBasename = (path: string, bns: Array<string> = []) =>
  bns.find((bn) => path.indexOf(bn) === 0)

// MISC

const createKey = () => {
  if (process.env.NODE_ENV === 'test') {
    return '123456789'.toString(36).substr(2, 6)
  }
  return Math.random()
    .toString(36)
    .substr(2, 6)
}
