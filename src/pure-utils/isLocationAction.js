// @flow
import type { Action } from '../flow-types'


export default (action: Action): boolean =>
  !!(action.meta && action.meta.location)
