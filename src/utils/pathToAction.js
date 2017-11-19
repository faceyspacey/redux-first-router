// @flow
import { compilePath } from 'rudy-match-path'
import { stripBasename, parsePath } from '../smart-history/utils/path'
import notFound from '../action-creators/notFound'
import { NOT_FOUND } from '../index'

import type { RoutesMap, ReceivedAction, QuerySerializer } from '../flow-types'

export default (
  loc: Object | string,
  routes: RoutesMap,
  basename: string = '',
  serializer?: QuerySerializer
): ReceivedAction => {
  const { url, state } = typeof loc === 'string' ? { url: loc } : loc
  const { pathname, search, hash } = parsePath(url)
  const path = basename ? stripBasename(pathname, basename) : pathname
  const query = (search && serializer && serializer.parse(search)) || {}
  const rVals = Object.keys(routes).map(key => routes[key])
  const rTypes = Object.keys(routes)

  let i = 0
  let match
  let keys

  while (!match && i < rVals.length) {
    const regPath = typeof rVals[i] === 'string' ? rVals[i] : rVals[i].path // route may be an object containing a route or a route string itself

    if (!regPath) {
      i++
      continue
    }

    const { re, keys: k } = compilePath(regPath)
    match = re.exec(path)
    keys = k
    i++
  }

  if (match) {
    i--

    const type = rTypes[i]
    const v = rVals[i]
    const capitalizedWords = typeof v === 'object' && v.capitalizedWords
    const fromPath = v && typeof v.fromPath === 'function' && v.fromPath

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
