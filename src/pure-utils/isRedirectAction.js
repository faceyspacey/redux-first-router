// @flow
import type { Action } from '../flow-types'

export default (action: Action): boolean =>
  !!(action &&
    action.meta &&
    action.meta.location &&
    action.meta.location.kind === 'redirect')
