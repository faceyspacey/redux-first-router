// @flow
import type { Action } from '../flow-types'

export default (action: Action, basename: string) => {
  action.meta = action.meta || {}
  action.meta.basename = basename
  return action
}

