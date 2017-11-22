// @flow
import pathToRegexp from 'path-to-regexp'

type CompileOptions = {
  end?: boolean,
  strict?: boolean
}

type MatchOptions = {
  exact?: boolean,
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

const patternCache = {}
const cacheLimit = 10000
let cacheCount = 0

export const compilePath = (
  pattern: string,
  options: CompileOptions = {}
): Compiled => {
  const { end = true, strict = false } = options
  const cacheKey = `${end ? 't' : 'f'}${strict ? 't' : 'f'}`
  const cache = patternCache[cacheKey] || (patternCache[cacheKey] = {})

  if (cache[pattern]) return cache[pattern]

  const keys = []
  const re = pathToRegexp(pattern, keys, options)
  const compiledPattern = { re, keys }

  if (cacheCount < cacheLimit) {
    cache[pattern] = compiledPattern
    cacheCount++
  }

  return compiledPattern
}

const toPathCache = {}

export const compileParamsToPath = (path: string, params: Object = {}) => {
  const toPath = toPathCache[path] || pathToRegexp.compile(path)
  toPathCache[path] = toPath
  return toPath(params)
}

const matchPath = (
  pathname: string,
  options: string | MatchOptions = {}
): ?Match => {
  if (typeof options === 'string') {
    options = { path: options, exact: false, strict: false }
  }

  const { path = '/', exact = false, strict = false } = options
  const { re, keys } = compilePath(path, { end: exact, strict })
  const match = re.exec(pathname)

  if (!match) return null

  const [url, ...values] = match
  const isExact = pathname === url

  if (exact && !isExact) return null

  return {
    path, // the path pattern used to match
    url: path === '/' && url === '' ? '/' : url, // the matched portion of the URL
    isExact, // whether or not we matched exactly
    params: keys.reduce((memo, key, index) => {
      memo[key.name] = values[index]
      return memo
    }, {})
  }
}

export default matchPath
