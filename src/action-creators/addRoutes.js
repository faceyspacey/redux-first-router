// @flow

import { ADD_ROUTES } from '../index'
import type { RoutesMap } from '../flow-types'

export default (routes: RoutesMap) => ({
  type: ADD_ROUTES,
  payload: { routes }
})
