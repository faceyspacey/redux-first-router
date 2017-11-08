// @flow
import type { Action } from '../flow-types'

export default (action: Action, status: number = 302, committed: boolean = true) => {
  action.meta = action.meta || {}
  action.meta.location = action.meta.location || {}
  action.meta.location.kind = action.kind = 'redirect'
  action.meta.location.status = action.meta.location.status || status
  action.meta.location.committed = committed

  return action
}

