// @flow
import type { Action, ReceivedAction } from '../flow-types'

export default (action: Object): boolean =>
  !!(action.meta && action.meta.location && action.meta.location.current)
