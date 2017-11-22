// @flow
import type { Action } from '../flow-types'
import { NOT_FOUND } from '../index'
import isFSRA from '../utils/isFSRA'

export default (
  act: ?(Object | string),
  url: ?string, // optional alternate url to display in address bar
  basename: ?string,
  type: ?string
) => {
  if (typeof act === 'string' && typeof url !== 'string') {
    url = act
    act = null
  }

  const action = isFSRA(act)
    ? { ...act, location: { url, basename, ...act.location } }
    : { payload: act || {}, location: { url, basename } } // if not FSRA, treat as a `payload` for convenience

  return {
    ...action,
    type: type || NOT_FOUND // type not meant for user to supply; it's passed by generated action creators
  }
}
