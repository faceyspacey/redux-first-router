// @flow
import pathToRegexp from 'path-to-regexp'
import qs from 'query-string'

const toPathCache = {}

export default (
  path: string,
  params: Object = {},
  query: ?Object,
  hash: ?string
) => {
  const toPath = toPathCache[path] || pathToRegexp.compile(path)
  toPathCache[path] = toPath

  const pathname = toPath(params)
  const search = query ? `?${qs.stringify(query)}` : ''
  const h = hash ? `#${hash}` : ''

  return `${pathname}${search}${h}`
}
