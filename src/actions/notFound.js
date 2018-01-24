// @flow
import type { Action } from '../flow-types'
import { NOT_FOUND } from '../types'
import { isAction } from '../utils'

export default (
  act: ?(Object | string),
  url: ?string, // optional alternate url to display in address bar
  basename: ?string,
  type: ?string
) => {
  if (typeof act === 'string') {
    type = basename
    basename = url
    url = act
    act = null
  }

  const action = isAction(act)
    ? { ...act, location: { url, basename, ...act.location } }
    : { params: act || {}, location: { url, basename } } // if not action, treat as  `params` for convenience

  return {
    ...action,
    type: type || NOT_FOUND // type not meant for user to supply; it's passed by generated action creators
  }
}
