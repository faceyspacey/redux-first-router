// @flow
import type { RoutesMapInput, CreateActionsOptions } from '../flow-types'

import { camelCase, logExports, makeActionCreator, formatRoute } from './utils'

export default (routesMap: RoutesMapInput, opts: CreateActionsOptions = {}) => {
  const {
    scene: sc,
    basename: bn,
    formatRoute: formatter,
    subtypes: st = [],
    logExports: log,
  } = opts

  const scene = sc || ''
  const prefix = scene ? `${scene}/` : ''
  const keys = Object.keys(routesMap)
  const subtypes = [...st, 'start', 'complete', 'error', 'done']

  const result = keys.reduce(
    (result, t) => {
      const { types, actions, routes } = result

      const t2 = `${prefix}${t}`
      const tc = `${prefix}${t}_COMPLETE`
      const te = `${prefix}${t}_ERROR`

      routes[t2] = formatRoute(routesMap[t], t2, routesMap, formatter)

      const route = routes[t2]
      const tClean = route.scene ? t2.replace(`${route.scene}/`, '') : t // strip the scene so types will be un-prefixed (NOTE: this is normalization for if routes pass through `createScene` twice)
      const action = camelCase(tClean)

      types[tClean] = t2
      types[`${tClean}_COMPLETE`] = tc
      types[`${tClean}_ERROR`] = te

      // allow for creating custom action creators (whose names are an array assigned to route.action)
      if (Array.isArray(route.action)) {
        const key = route.action[0]
        actions[action] = makeActionCreator(route, t2, key, bn) // the first action in the array becomes the primary action creator

        // all are tacked on like action.complete, action.error
        route.action.forEach((key: string) => {
          actions[action][key] = makeActionCreator(route, t2, key, bn)
        })
      } else {
        actions[action] = makeActionCreator(route, t2, 'action', bn)
      }

      subtypes.forEach((name) => {
        const suffix = `_${name.toUpperCase()}`
        const cleanType = `${tClean}${suffix}`
        const realType = `${prefix}${t}${suffix}`

        types[cleanType] = realType
        actions[action][name] = makeActionCreator(
          route,
          realType,
          name,
          bn,
          subtypes,
        )
      })

      return result
    },
    { types: {}, actions: {}, routes: {} },
  )

  const { types, actions } = result
  // $FlowFixMe
  if (log && /^(development|test)$/.test(process.env.NODE_ENV)) {
    result.exportString = logExports(types, actions, result.routes, opts)
  }

  return result
}
