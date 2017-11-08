// @flow
import type { Action } from '../flow-types'

export default (action: Action): boolean =>
  !!(
    action &&
    action.meta &&
    action.meta.location &&
    action.meta.location.kind === 'redirect'
  )

export const isCommittedRedirect = (action: Action, req) =>
  !!(
    action &&
    action.meta &&
    action.meta.location &&
    action.meta.location.kind === 'redirect' &&
    (req.temp.committed || action.meta.location.committed)
  )
