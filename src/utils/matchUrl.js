// @flow
import pathToRegexp from 'path-to-regexp'
import { urlToLocation, locationToUrl } from '../history/utils'
import type { Route, Options } from '../flow-types'

export default (
  location: string | Location,
  matchers: Matchers,
  options?: Object = {},
  route: Route,
  opts: Options = {}
) => {
  const { pathname, search, hash: h } = urlToLocation(location)

  const { match, keys } = matchPath(pathname, matchers.path, options)
  if (!match) return null

  const query = matchQuery(search, matchers.query, route, opts)
  if (!query) return null

  const hash = matchHash(h, matchers.hash, route, opts)
  if (hash === null) return null

  const [path, ...values] = match
  const params = keys.reduce((params, key, index) => {
    params[key.name] = values[index]
    return params
  }, {})

  const { fromPath, fromSearch, fromHash } = options

  return {
    params: fromPath ? fromPath(params, route, opts) : params,
    query: fromSearch ? fromSearch(query, route, opts) : query,
    hash: fromHash ? fromHash(hash || '', route, opts) : (hash || ''),
    matchedPath: matchers.path === '/' && path === '' ? '/' : path, // the matched portion of the URL/path
    matchers,
    partial: !!options.partial
  }

  // const url = matchers.path === '/' && path === '' ? '/' : path // the matched portion of the path

  // return {
  //   path: matchers.path,
  //   url, // called `url` instead of `path` for compatibility with React Router
  //   fullUrl: url === '/' ? url : locationToUrl({ pathname: path, search, hash }), // MAYBE WE DONT WANT THIS??
  //   isExact: pathname === path,
  //   params: fromPath ? fromPath(params, route, opts) : params,
  //   query: fromSearch ? fromSearch(query, route, opts) : query,
  //   hash: fromHash ? fromHash(hash || '', route, opts) : (hash || '')
  // }
}

const matchPath = (pathname, matcher, options = {}) => {
  const { re, keys } = compilePath(matcher, options)
  const match = re.exec(pathname)

  if (!match || (options.exact && match[0] !== pathname)) return {}

  return { match, keys }
}

export const matchQuery = (search, matcher, route, opts) => {
  const query = search ? parseSearch(search, route, opts) : {}

  if (!matcher) return query

  for (const key in matcher) {
    const val = query[key]
    const expected = matcher[key]
    if (!matchVal(val, expected, key, route, opts)) return null
  }

  return query
}

export const matchHash = (hash = '', expected, route, opts) => {
  if (expected === undefined) return hash
  return matchVal(hash, expected, 'hash', route, opts) ? hash : null
}

export const matchVal = (val, expected, key, route, opts) => {
  const type = typeof expected

  if (type === 'boolean') {
    if (expected === true) {
      return val !== '' && val !== undefined
    }

    return val === undefined || val === ''
  }
  else if (type === 'string') {
    return expected === val
  }
  else if (type === 'function') {
    return key === 'hash'
      ? expected(val, route, opts)
      : expected(val, key, route, opts)
  }
  else if (expected instanceof RegExp) {
    return expected.test(val)
  }

  return true
}


const parseSearch = (search: string, route: Route, opts: Options) => {
  if (queries[search]) return queries[search]
  const parse = route.parseQuery || opts.parseQuery
  return queries[search] = parse(search)
}

const queries = {}
const patternCache = {}

const cacheLimit = 10000
let cacheCount = 0

const compilePath = (
  pattern: string,
  options: CompileOptions = {}
): Compiled => {
  const { partial = false, strict = false } = options
  const cacheKey = `${partial ? 't' : 'f'}${strict ? 't' : 'f'}`
  const cache = patternCache[cacheKey] || (patternCache[cacheKey] = {})

  if (cache[pattern]) return cache[pattern]

  const keys = []
  const re = pathToRegexp(pattern, keys, { end: !partial, strict })
  const compiledPattern = { re, keys }

  if (cacheCount < cacheLimit) {
    cache[pattern] = compiledPattern
    cacheCount++
  }

  return compiledPattern
}







type CompileOptions = {
  partial?: boolean,
  strict?: boolean
}

type MatchOptions = {
  partial?: boolean,
  strict?: boolean,
  path?: string
}

type Compiled = {
  re: RegExp,
  keys: Array<{ name: string }>
}

type Match = {
  path: string,
  url: string,
  isExact: boolean,
  params: Object
}

type Matchers = {
  path: string,
  query?: Object,
  hash?: string
}

type Location = {
  pathname: string,
  search: string,
  hash: string
}
