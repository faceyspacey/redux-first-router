// @flow
import type { Action } from '../flow-types'
import { isAction } from '../utils'

export default (
  act: ?(Object | string),
  notFoundUrl: ?string, // optional alternate url to display in address bar
  type: ?string
) => {
  if (typeof act === 'string') {
    type = notFoundUrl
    notFoundUrl = act
    act = undefined
  }

  type = type || 'NOT_FOUND' // type not meant for user to supply; it's passed by generated action creators

  return isAction(act)
    ? { ...act, type, notFoundUrl }
    : { params: act, type, notFoundUrl } // if not action, treat as  `params` for convenience
}
