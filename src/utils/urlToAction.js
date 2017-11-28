// @flow
import qs from 'query-string'
import { matchUrl } from './index'
import { stripBasename, parsePath } from '../history/utils'
import { notFound } from '../actions'

import type { RoutesMap, ReceivedAction } from '../flow-types'

export default (
  loc: Object | string,
  routes: RoutesMap,
  basename: string = ''
): ReceivedAction => {
  const { url, state } = typeof loc === 'string' ? { url: loc } : loc
  const types = Object.keys(routes).filter(type => routes[type].path)
  const l = parsePath(url)
  l.pathname = basename ? stripBasename(l.pathname, basename) : l.pathname

  for (let i = 0; i < types.length; i++) {
    const type = types[i]
    const route = routes[type]
    const transform = transformValue.bind(null, route)
    const match = matchUrl(l, route, { transform })

    if (match) {
      const { payload, query, hash } = match
      return { type, state, payload, query, hash }
    }
  }

  // This will basically only end up being called if the developer is manually calling history.push().
  // Or, if visitors visit an invalid URL, the developer can use the NOT_FOUND type to show a not-found page to
  const { search, hash } = l
  const payload = {}
  const query = search ? qs.parse(search) : {}
  return notFound({ payload, query, hash, state }, url)
}

const transformValue = (
  route: Object = {},
  val: string,
  name
) => {
  if (typeof val === 'string') {
    if (route.fromPath) {
      return route.fromPath && route.fromPath(val, name)
    }
    else if (true && isNumber(val)) { // route.convertNumbers
      return parseFloat(val)
    }
    else if (route.capitalizedWords) {
      return val.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) // 'my-category' -> 'My Category'
    }
  }

  return val
}

const isNumber = (val: string) => !val.match(/^\s*$/) && !isNaN(val)
