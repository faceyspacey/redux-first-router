// @flow
import type { LocationAction } from '../flow-types'

export default (action: LocationAction): boolean =>
  !!(
    action &&
    action.location &&
    (action.location.kind === 'replace' || action.location.from)
  ) // sometimes the kind will be back/next when automatic back/next detection is in play
