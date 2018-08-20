// @flow

import { ADD_ROUTES } from '../types'
import type { Routes } from '../flow-types'

export default (routes: Routes, formatRoute: ?Function) => ({
  type: ADD_ROUTES,
  payload: { routes, formatRoute },
})

// NOTE: see `src/utils/formatRoutes.js` for implementation of corresponding pathlessRoute
