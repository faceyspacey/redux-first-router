// @flow

import { ADD_ROUTES } from '../index'
import type { RoutesMap, Dispatch } from '../flow-types'

export default (routes: RoutesMap) => (dispatch: Dispatch) =>
  dispatch({ type: ADD_ROUTES, payload: { routes } })
