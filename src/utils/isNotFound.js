// @flow
import type { Action } from '../flow-types'

export default (action: Action | string): boolean => {
  if (typeof action === 'string') {
    return action.indexOf('NOT_FOUND') > -1 &&
      action.indexOf('_COMPLETE') === -1// type string passed instead of action object
  }

  return action && action.type.indexOf('NOT_FOUND') > -1 &&
    action.type.indexOf('_COMPLETE') === -1
}
