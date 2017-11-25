// @flow

import actionToPath from '../../utils/actionToPath'
import type { RoutesMap } from '../../flow-types'

export type To = string | Array<string> | Object

export default (to?: ?To, routes: RoutesMap, basename: ?string): string => {
  if (to && typeof to === 'string') {
    return basename ? basename + to : to
  }
  else if (Array.isArray(to)) {
    const path = `/${to.join('/')}`
    return basename ? basename + path : path
  }
  else if (typeof to === 'object') {
    const action = to

    try {
      const path = actionToPath(action, routes)
      return basename ? basename + path : path
    }
    catch (e) {
      console.warn(
        '[redux-first-router-link] could not create path from action:',
        action,
        'For reference, here are your current routes:',
        routes
      )

      return '#'
    }
  }

  console.warn(
    '[redux-first-router-link] `to` prop must be a string, array or action object. You provided:',
    to
  )
  return '#'
}
