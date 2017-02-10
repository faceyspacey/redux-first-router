// @flow
import type { Action, PlainAction } from '../flow-types'


export default (action: Action | PlainAction): boolean =>
  !!(action.meta && action.meta.location)
