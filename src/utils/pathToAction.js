// @flow
import qs from 'query-string'
import { compilePath } from './matchPath'
import { stripBasename, parsePath } from '../smart-history/utils/path'
import notFound from '../action-creators/notFound'

import type { RoutesMap, ReceivedAction } from '../flow-types'

export default (
  loc: Object | string,
  routes: RoutesMap,
  basename: string = ''
): ReceivedAction => {
  const { url, state } = typeof loc === 'string' ? { url: loc } : loc
  const { pathname, search, hash } = parsePath(url)
  const path = basename ? stripBasename(pathname, basename) : pathname
  const query = search ? qs.parse(search) : {}
  const types = Object.keys(routes).filter(type => routes[type].path)

  let i = 0
  let match
  let keys
  let route
  let type

  while (!match && i < types.length) {
    type = types[i]
    route = routes[type]

    const result = isPathMatch(path, route.path)
    match = result.match
    keys = result.keys

    if (match && route.query && !isQueryMatch(query, route.query)) {
      match = null
    }

    if (match && route.hash && !isMatch(hash, route.hash)) {
      match = null
    }

    i++
  }

  if (match && route) {
    const { capitalizedWords, fromPath } = route

    const payload = (keys || []).reduce((payload, key, index) => {
      let val = match && match[index + 1] // item at index 0 is the overall match, whereas those after correspond to the key's index

      if (typeof val === 'string') {
        if (fromPath) {
          val = fromPath && fromPath(val, key.name)
        }
        else if (isNumber(val)) {
          val = parseFloat(val)
        }
        else if (capitalizedWords) {
          val = val.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) // 'my-category' -> 'My Category'
        }
      }

      payload[key.name] = val
      return payload
    }, {})


    return { type, payload, query, hash, state }
  }

  // This will basically only end up being called if the developer is manually calling history.push().
  // Or, if visitors visit an invalid URL, the developer can use the NOT_FOUND type to show a not-found page to
  return notFound({ query, hash, state }, url)
}


const isNumber = (val: string) => !val.match(/^\s*$/) && !isNaN(val)

const isPathMatch = (path, matcher) => {
  const { re, keys } = compilePath(matcher)
  const match = re.exec(path)
  return { match, keys }
}

const isQueryMatch = (query, matcher) => {
  for (const key in matcher) {
    const val = query[key]
    const expected = matcher[key]
    if (!isMatch(val, expected)) return false
  }

  return true
}

const isMatch = (val, expected) => {
  const type = typeof expected

  if (type === 'boolean') {
    return val !== '' && val !== undefined
  }
  else if (type === 'string') {
    return expected === val
  }
  else if (type === 'function') {
    return expected(val)
  }
  else if (expected instanceof RegExp) {
    return expected.test(val)
  }

  return true
}
