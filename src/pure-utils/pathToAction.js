// @flow
import pathToRegexp from 'path-to-regexp'
import { NOT_FOUND } from '../index'
import objectValues from './objectValues'
import type { RoutesMap, ReceivedAction, QuerySerializer } from '../flow-types'

export default (
  pathname: string,
  routesMap: RoutesMap,
  serializer?: QuerySerializer
): ReceivedAction => {
  const parts = pathname.split('?')
  const search = parts[1]
  const query = search && serializer && serializer.parse(search)
  const routes = objectValues(routesMap)
  const routeTypes = Object.keys(routesMap)

  pathname = parts[0]

  let i = 0
  let match
  const keys = []

  while (!match && i < routes.length) {
    keys.length = 0 // empty the array and start over
    const routePath = routes[i].path || routes[i] // route may be an object containing a route or a route string itself
    const reg = pathToRegexp(routePath, keys)
    match = reg.exec(pathname)
    i++
  }

  if (match) {
    i--

    const capitalizedWords =
      typeof routes[i] === 'object' && routes[i].capitalizedWords
    const fromPath =
      routes[i] &&
      typeof routes[i].fromPath === 'function' &&
      routes[i].fromPath
    const type = routeTypes[i]

    const payload = keys.reduce((payload, key, index) => {
      let value = match && match[index + 1] // item at index 0 is the overall match, whereas those after correspond to the key's index

      value = typeof value === 'string' && value.match(/^\d+$/)
        ? parseFloat(value) // make sure pure numbers aren't passed to reducers as strings
        : value

      value = capitalizedWords && typeof value === 'string'
        ? value.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) // 'my-category' -> 'My Category'
        : value

      value = fromPath && typeof value === 'string'
        ? fromPath(value, key.name)
        : value

      payload[key.name] = value

      return payload
    }, {})

    return { type, payload, meta: query ? { query } : {} }
  }

  // This will basically will only end up being called if the developer is manually calling history.push().
  // Or, if visitors visit an invalid URL, the developer can use the NOT_FOUND type to show a not-found page to
  const meta = { notFoundPath: pathname, ...(query ? { query } : {}) }
  return { type: NOT_FOUND, payload: {}, meta }
}
