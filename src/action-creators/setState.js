// @flow

import { SET_STATE } from '../index'
import type { RoutesMap } from '../flow-types'

export default (state: Object | Function) => ({
  type: SET_STATE,
  state
})
