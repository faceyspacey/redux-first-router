// @flow
import type { RoutesMapInput, CreateActionsOptions } from '../flow-types'
import { NOT_FOUND } from '../types'

import {
  camelCase,
  logExports,
  makeActionCreator,
  routeToObject
} from './utils'

export default (r: RoutesMapInput, opts: CreateActionsOptions = {}) => {
  const { scene: sc, basename: bn, logExports: log } = opts

  const scene = sc || ''
  const prefix = scene ? `${scene}/` : ''
  const keys = Object.keys(r)

  const result = keys.reduce((result, t) => {
    const { types, actions, routes } = result

    const t2 = `${prefix}${t}`
    const tc = `${prefix}${t}_COMPLETE`
    const te = `${prefix}${t}_ERROR`

    const route = routes[t2] = routeToObject(r[t], t2)
    const tClean = route.scene ? t2.replace(`${route.scene}/`, '') : t // strip the scene so keys/exports are un-prefixed
    const name = camelCase(tClean)

    types[tClean] = t2
    types[`${tClean}_COMPLETE`] = tc
    types[`${tClean}_ERROR`] = te

    // allow for creating custom action creators (whose names are an array assigned to route.action)
    if (Array.isArray(route.action)) {
      const key = route.action[0]
      actions[name] = makeActionCreator(route, t2, key, bn) // the first name in the array becomes the primary action creator

      // all are tacked on like name.complete, name.error
      route.action.forEach((key: string) => {
        actions[name][key] = makeActionCreator(route, t2, key, bn)
      })
    }
    else {
      actions[name] = makeActionCreator(route, t2, 'action', bn)
    }

    actions[name].complete = makeActionCreator(route, tc, 'complete', bn)
    actions[name].error = makeActionCreator(route, te, 'error', bn)

    return result
  }, { types: {}, actions: {}, routes: {} })

  const { types, actions } = result

  // insure @@rudy/NOT_FOUND keys/exports are also un-prefixed, eg: NOT_FOUND, notFound, etc
  if (types[NOT_FOUND]) {
    types.NOT_FOUND = types[NOT_FOUND]
    types.NOT_FOUND_COMPLETE = types[`${NOT_FOUND}_COMPLETE`]
    types.NOT_FOUND_ERROR = types[`${NOT_FOUND}_ERROR`]
    delete types[NOT_FOUND]
    delete types[`${NOT_FOUND}_COMPLETE`]
    delete types[`${NOT_FOUND}_ERROR`]

    actions.notFound = actions.rudyNotFound
    delete actions.rudyNotFound
  }

  if (log && /development|test/.test(process.env.NODE_ENV)) {
    result.exportString = logExports(types, actions, result.routes, opts)
  }

  return result
}
