// @flow
import { compilePath } from 'rudy-match-path'
import { stripBasename } from 'rudy-history/PathUtils'
import { NOT_FOUND } from '../index'

import type { RoutesMap, ReceivedAction, QuerySerializer } from '../flow-types'

export default (
  pathname: string,
  routes: RoutesMap,
  basename: string = '',
  serializer?: QuerySerializer
): ReceivedAction => {
  const parts = pathname.split('?')
  const search = parts[1]
  const query = search && serializer && serializer.parse(search)
  const rVals = Object.keys(routes).map(key => routes[key])
  const rTypes = Object.keys(routes)

  pathname = basename ? stripBasename(parts[0], basename) : parts[0]

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
    match = re.exec(pathname)
    keys = k
    i++
  }

  if (match) {
    i--

    const capitalizedWords =
      typeof rVals[i] === 'object' && rVals[i].capitalizedWords

    const fromPath =
      rVals[i] &&
      typeof rVals[i].fromPath === 'function' &&
      rVals[i].fromPath

    const type = rTypes[i]

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

    if (query) payload.query = query

    return { type, payload, meta: {} }
  }

  // This will basically will only end up being called if the developer is manually calling history.push().
  // Or, if visitors visit an invalid URL, the developer can use the NOT_FOUND type to show a not-found page to
  const payload = query ? { query } : {}
  const meta = { notFoundPath: pathname }
  return { type: NOT_FOUND, payload, meta }
}

const isNumber = (val: string) => !val.match(/^\s*$/) && !isNaN(val)
