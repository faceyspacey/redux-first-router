// @flow
import { CLEAR_CACHE } from '../types'

export default (invalidator?: any, options?: Object) => ({
  type: CLEAR_CACHE,
  payload: { invalidator, options },
})

// NOTE: see `src/utils/formatRoutes.js` for implementation of corresponding pathlessRoute
