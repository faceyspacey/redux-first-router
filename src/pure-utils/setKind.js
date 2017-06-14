// @flow
import type { Action } from '../flow-types'

export default (action: Action, kind: string) => {
  action.meta = action.meta || {}
  action.meta.location = action.meta.location || {}
  action.meta.location.kind = kind

  return action
}
