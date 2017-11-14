// @flow
import type { Action } from '../flow-types'
import { NOT_FOUND } from '../index'

export default (action: Action | string): boolean => {
  if (typeof action === 'string') return action.indexOf(NOT_FOUND) > -1
  return action && action.type.indexOf(NOT_FOUND) > -1
}
