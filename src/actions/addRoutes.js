// @flow

import { ADD_ROUTES } from '../types'
import type { RoutesMap } from '../flow-types'

export default (routes: RoutesMap, formatRoute: ?Function) => ({
  type: ADD_ROUTES,
  payload: { routes, formatRoute }
})

// NOTE: see `src/utils/formatRoutes.js` for implemenation of corresponding pathlessRoute
