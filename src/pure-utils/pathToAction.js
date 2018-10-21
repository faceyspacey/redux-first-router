// @flow
import { compilePath } from 'rudy-match-path'
import { stripBasename } from 'rudy-history/PathUtils'
import { NOT_FOUND, getOptions } from '../index'
import objectValues from './objectValues'

import type { RoutesMap, ReceivedAction, QuerySerializer } from '../flow-types'

export default (
  pathname: string,
  routesMap: RoutesMap,
  serializer?: QuerySerializer,
  basename?: string | void = getOptions().basename,
  strict?: boolean | void = getOptions().strict
): ReceivedAction => {
  const parts = pathname.split('?')
  const search = parts[1]
  const query = search && serializer && serializer.parse(search)
  const routes = objectValues(routesMap)
  const routeTypes = Object.keys(routesMap)

  pathname = basename ? stripBasename(parts[0], basename) : parts[0]

  let i = 0
  let match
  let keys

  while (!match && i < routes.length) {
    const regPath = typeof routes[i] === 'string' ? routes[i] : routes[i].path // route may be an object containing a route or a route string itself

    if (!regPath) {
      i++
      continue
    }

    const { re, keys: k } = compilePath(regPath, { strict })
    match = re.exec(pathname)
    keys = k
    i++
  }

  if (match) {
    i--

    const capitalizedWords =
      typeof routes[i] === 'object' && routes[i].capitalizedWords


    const coerceNumbers =
      typeof routes[i] === 'object' && routes[i].coerceNumbers

    const fromPath =
      routes[i] &&
      typeof routes[i].fromPath === 'function' &&
      routes[i].fromPath

    const userMeta = typeof routes[i] === 'object' && routes[i].meta

    const type = routeTypes[i]

    const payload = (keys || []).reduce((payload, key, index) => {
      let val = match && match[index + 1] // item at index 0 is the overall match, whereas those after correspond to the key's index

      if (typeof val === 'string') {
        if (fromPath) {
          val = fromPath && fromPath(val, key.name)
        }
        else if (coerceNumbers && isNumber(val)) {
          val = parseFloat(val)
        }
        else if (capitalizedWords) {
          val = val.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) // 'my-category' -> 'My Category'
        }
      }

      payload[key.name] = val
      return payload
    }, {})

    const meta = {
      ...(userMeta ? { meta: userMeta } : {}),
      ...(query ? { query } : {})
    }
    return { type, payload, meta }
  }

  // This will basically will only end up being called if the developer is manually calling history.push().
  // Or, if visitors visit an invalid URL, the developer can use the NOT_FOUND type to show a not-found page to
  const meta = { notFoundPath: pathname, ...(query ? { query } : {}) }
  return { type: NOT_FOUND, payload: {}, meta }
}

const isNumber = (val: string) => /^\d+$/.test(val)
