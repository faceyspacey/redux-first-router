// @flow
import type { Action } from '../flow-types'
import { CHANGE_BASENAME } from '../types'

export default (basename: string, action: ?Action) => {
  if (!action) {
    return {
      type: CHANGE_BASENAME,
      payload: { basename }
    }
  }

  return { ...action, basename }
}

// NOTE: see `src/utils/formatRoutes.js` for implemenation of corresponding pathlessRoutes
