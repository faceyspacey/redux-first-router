// @flow
import resolvePathname from 'resolve-pathname'
import { urlToLocation, locationToUrl, cleanBasename, matchUrl } from './index'
import { notFound } from '../actions'
import type { RoutesMap, ReceivedAction, Route, Options } from '../flow-types'

export default (url, routes, opts, state, key, curr = {}, bn = '') => {
  const { basename, slashBasename } = createBasename(url, opts, bn, curr)

  const location = createLocation(url, opts, slashBasename, curr)
  const action = createAction(location, routes, opts, state, curr)

  return {
    ...action, // { type, params, query, state, hash }
    basename,
    location: {
      scene: routes[action.type].scene || '',
      key: key || Math.random().toString(36).substr(2, 6),
      url: slashBasename + locationToUrl(location),
      pathname: location.pathname,
      search: location.search
    }
  }
}

const createBasename = (url, opts, bn, curr) => {
  bn = findBasename(url, opts.basenames) || bn || curr.basename

  const slashBasename = cleanBasename(bn)
  const basename = slashBasename.replace(/^\//, '') // eg: '/base' -> 'base'

  return { basename, slashBasename } // { 'base', '/base' }
}

const createLocation = (url, opts, bn, curr) => {
  if (!url) {
    url = curr.pathname || '/'
  }
  else if (curr.pathname && url.charAt(0) !== '/') {
    url = resolvePathname(url, curr.pathname) // resolve pathname relative to current location
  }
  else {
    url = stripBasename(url, bn) // eg: /base/foo?a=b#bar -> /foo?a=b#bar
  }

  return urlToLocation(url) // gets us: { pathname, search, hash } properly formatted
}

const createAction = (
  loc: Object,
  routes: RoutesMap,
  opts: Options,
  st: Object = {},
  curr: Object
): ReceivedAction => {
  const types = Object.keys(routes).filter(type => routes[type].path)

  for (let i = 0; i < types.length; i++) {
    const type = types[i]
    const route = routes[type]
    const match = matchUrl(loc, route, transformers, route, opts)

    if (match) {
      const { params, query, hash } = match
      const state = fromState(st, route, opts)
      return { type, params, query, hash, state }
    }
  }

  const { scene } = routes[curr.type] || {}
  const type = routes[`${scene}/NOT_FOUND`] && `${scene}/NOT_FOUND`// try to interpret scene-level NOT_FOUND if available (note: links create plain NOT_FOUND actions)

  return {
    ...notFound(st, type),
    params: {},
    query: loc.search ? parseQuery(loc.search, routes, opts) : {}, // keep this info
    hash: loc.hash || ''
  }
}


// EVERYTHING BELOW IS RELATED TO THE TRANSFORMERS PASSED TO `matchUrl`:

const fromPath = (params: Object, route: Route, opts: Options) => {
  const from = route.fromPath || defaultFromPath

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

const defaultFromPath = (
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
    return decodedVal.replace(/-/g, ' ').replace(/\b\w/g, ltr => ltr.toUpperCase()) // 'my-category' -> 'My Category'
  }

  return opts.fromPath
    ? opts.fromPath(decodedVal, key, val, route, opts)
    : decodedVal
}

const fromSearch = (query: Object, route: Route, opts: Options) => {
  const from = route.fromSearch || opts.fromSearch

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
  const def = route.defaultState || opts.defaultState
  return def
    ? typeof def === 'function' ? def(state, route, opts) : { ...def, ...state }
    : state
}

const transformers = { fromPath, fromSearch, fromHash }

const isNumber = (val: string) => /^\d+$/.test(val)

const parseQuery = (search, routes, opts) =>
  (routes.NOT_FOUND.parseQuery || opts.parseQuery)(search)

const stripBasename = (path, bn) =>
  path.indexOf(bn) === 0 ? path.substr(bn.length) : path

const findBasename = (path, bns = []) =>
  bns.find(bn => path.indexOf(bn) === 0)

