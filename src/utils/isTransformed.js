// @flow
import type { Action, ReceivedAction } from '../flow-types'

export default (action: Object): boolean =>
  action.location && action.location.url
