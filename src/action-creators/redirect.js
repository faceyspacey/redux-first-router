// @flow
import type { Action } from '../flow-types'
import setKind from '../pure-utils/setKind'

export default (action: Action, type?: string, payload?: any) => {
  action = setKind(action, 'redirect')

  if (type) {
    action.type = type
  }

  if (payload) {
    action.payload = payload
  }

  return action
}
