// @flow
import pathToRegexp from 'path-to-regexp'
import { urlToLocation } from './index'
import type { Route, Options } from '../flow-types'


export default (
  loc: string | Location,
  matchers: Matchers,
  options?: Object = {},
  route: Route,
  opts: Options = {}
) => {
  const { pathname, search, hash: h } = urlToLocation(loc)

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

  const { formatParams, formatQuery, formatHash } = options

  return {
    params: formatParams ? formatParams(params, route, opts) : params,
    query: formatQuery ? formatQuery(query, route, opts) : query,
    hash: formatHash ? formatHash(hash || '', route, opts) : (hash || ''),
    matchedPath: matchers.path === '/' && path === '' ? '/' : path, // the matched portion of the URL/path
    matchers,
    partial: !!options.partial
  }

  // const url = matchers.path === '/' && path === '' ? '/' : path // the matched portion of the path

  // return {
  //   path: matchers.path,
  //   url, // called `url` instead of `path` for compatibility with React Router
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

export const matchQuery = (
  search: string,
  matcher: ?Object,
  route: Route,
  opts: Options
): null | {} => {
  const query: {} = search ? parseSearch(search, route, opts) : {}

  if (!matcher) return query

  for (const key in matcher) {
    const val = query[key]
    const expected = matcher[key]
    if (!matchVal(val, expected, key, route, opts)) return null
  }

  return query
}

export const matchHash = (hash: string = '', expected: ?string, route: Route, opts: Options): string | null => {
  if (expected === undefined) return hash
  return matchVal(hash, expected, 'hash', route, opts) ? hash : null
}

export const matchVal = (
  val: ?string,
  // TODO: What flow-type is best for expected
  // $FlowFixMe
  expected,
  key: string,
  route: Route,
  opts: Options
) => {
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
      // $FlowFixMe
      ? expected(val, route, opts)
      // $FlowFixMe
      : expected(val, key, route, opts)
  }
  else if (expected instanceof RegExp) {
    return expected.test(val)
  }

  return true
}


const parseSearch = (search: string, route: Route, opts: Options): Object => {
  if (queries[search]) return queries[search]
  const parse = route.parseSearch || opts.parseSearch
  return queries[search] = parse(search)
}

const queries: {} = {}
const patternCache: {} = {}

const cacheLimit = 10000
let cacheCount = 0

const compilePath = (
  pattern: string,
  options: CompileOptions = {}
): Compiled => {
  const {
    partial = false,
    strict = false
  }: {
    partial?: boolean,
    strict?: boolean
  } = options

  const cacheKey: string = `${partial ? 't' : 'f'}${strict ? 't' : 'f'}`
  const cache: {} = patternCache[cacheKey] || (patternCache[cacheKey] = {})

  if (cache[pattern]) return cache[pattern]

  const keys: [] = []
  const re = pathToRegexp(pattern, keys, { end: !partial, strict })
  const compiledPattern = { re, keys }

  if (cacheCount < cacheLimit) {
    cache[pattern] = compiledPattern
    cacheCount++
  }
  // TODO: Not sure the best way to construct this one
  // $FlowFixMe
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
