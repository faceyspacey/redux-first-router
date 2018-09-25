// @flow
import type { Action } from '../flow-types'

export default (action: Action | string): boolean => {
  const type = typeof action === 'string' ? action : action.type || ''
  return type.indexOf('NOT_FOUND') > -1 && type.indexOf('NOT_FOUND_') === -1 // don't include types like `NOT_FOUND_COMPLETE`
}
