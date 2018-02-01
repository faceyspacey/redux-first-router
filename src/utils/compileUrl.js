// @flow
import pathToRegexp from 'path-to-regexp'
import qs from 'query-string'
import { matchQuery, matchVal } from './matchUrl'

import type {
  Route,
  Options
} from '../flow-types'

const toPathCache = {}

export default (
  path: string,
  params: Object = {},
  query: ?Object,
  hash: ?string,
  route: Route = {},
  opts: Options
) => {
  const search = stringify(query, route, opts)

  if (route.query && !matchQuery(search, route.query, route, opts)) {
    throw new Error('[rudy] invalid query object')
  }

  if (route.hash && !matchVal(hash, route.hash, 'hash', route, opts)) {
    throw new Error('[rudy] invalid hash value')
  }

  const toPath = toPathCache[path] || pathToRegexp.compile(path)
  toPathCache[path] = toPath

  const p = toPath(params, { encode: x => x })
  const s = query ? `?${search}` : ''
  const h = hash ? `#${hash}` : ''

  return p + s + h
}

const stringify = (query, route: Route, opts: Options) =>
  query
    ? (route.stringifyQuery || opts.stringifyQuery || qs.stringify)(query, {
        encode: true
      })
    : ''

