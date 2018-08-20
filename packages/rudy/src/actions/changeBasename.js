// @flow
import type { Action } from '../flow-types'
import { CHANGE_BASENAME } from '../types'

export default (basename: string, action: ?Action): Object => {
  if (!action) {
    return {
      type: CHANGE_BASENAME,
      payload: { basename },
    }
  }

  return { ...action, basename }
}

// NOTE: the first form with type `CHANGE_BASENAME` will trigger the pathlessRoute middleware
// see `src/utils/formatRoutes.js` for implementation of corresponding pathlessRoute
