// @flow
import type { Action } from '../flow-types'

export default (action: Action): boolean =>
  !!(
    action &&
    action.location &&
    action.location.kind === 'redirect'
  )
