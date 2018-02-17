// @flow
import { CLEAR_CACHE } from '../types'

export default (invalidator?: any, options?: Object) => {
  return {
    type: CLEAR_CACHE,
    payload: { invalidator, options }
  }
}

// NOTE: see `src/utils/formatRoutes.js` for implemenation of corresponding pathlessRoute
