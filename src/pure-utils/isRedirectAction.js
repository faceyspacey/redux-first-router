// @flow
import type { Action, ReceivedAction } from '../flow-types'

export default (action: Object): boolean =>
  !!(action &&
    action.meta &&
    action.meta.location &&
    action.meta.location.kind === 'redirect')
