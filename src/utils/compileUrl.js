// @flow
import { compile } from 'path-to-regexp'
import { matchQuery, matchHash } from './matchUrl'

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
  const search = query ? stringify(query, route, opts) : ''

  if (route.query && !matchQuery(search, route.query, route, opts)) {
    throw new Error('[rudy] invalid query object')
  }

  if (route.hash !== undefined && matchHash(hash, route.hash, route, opts) == null) {
    throw new Error('[rudy] invalid hash value')
  }

  const toPath = toPathCache[path] = toPathCache[path] || compile(path)

  const p = toPath(params, { encode: x => x })
  const s = search ? `?${search}` : ''
  const h = hash ? `#${hash}` : ''

  return p + s + h
}

const stringify = (query, r: Route, o: Options) =>
  (r.stringifyQuery || o.stringifyQuery)(query)

