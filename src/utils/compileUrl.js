// @flow
import pathToRegexp from 'path-to-regexp'
import qs from 'query-string'
import { matchQuery, matchVal } from './matchUrl'

const toPathCache = {}

export default (
  path: string,
  params: Object = {},
  query: ?Object,
  hash: ?string,
  route: Object = {}
) => {
  const search = qs.stringify(query)

  if (route.query && !matchQuery(search, route.query)) {
    throw new Error('[rudy] invalid query object')
  }

  if (route.hash && !matchVal(hash, route.hash)) {
    throw new Error('[rudy] invalid hash value')
  }

  const toPath = toPathCache[path] || pathToRegexp.compile(path)
  toPathCache[path] = toPath

  const p = toPath(params)
  const s = query ? `?${search}` : ''
  const h = hash ? `#${hash}` : ''

  return p + s + h
}

