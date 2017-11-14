// @flow
import type { Action } from '../flow-types'
import { NOT_FOUND } from '../index'
import isFSRA from '../utils/isFSRA'

export default (
  act: ?(Object | string),
  notFoundPath: ?string,
  basename: ?string,
  type: ?string
) => {
  if (typeof act === 'string' && typeof notFoundPath !== 'string') {
    notFoundPath = act
    act = null
  }

  const action = isFSRA(act)
    ? { ...act, meta: { basename, ...act.meta } }
    : { payload: act || {}, meta: { basename } } // if not FSRA, treat as a `payload` for convenience

  return {
    ...action,
    type: type || NOT_FOUND, // type not meant for user to supply; it's passed by generated action creators
    meta: {
      notFoundPath,
      ...action.meta
    }
  }
}
