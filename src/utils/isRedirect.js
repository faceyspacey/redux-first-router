// @flow
import type { Action } from '../flow-types'

export default (action: Action): boolean =>
  !!(
    action &&
    action.location &&
    (action.location.kind === 'redirect' || action.location.from) // sometimes the kind will be back/next when automatic back/next detection is in play
  )
