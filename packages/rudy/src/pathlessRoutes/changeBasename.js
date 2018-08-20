// @flow
import type { Dispatch, Action } from '../flow-types'

export default ({
  getLocation,
  has,
  action,
  dispatch,
}: {
  getLocation: Function,
  action: Action,
  has: Function,
  dispatch: Dispatch,
}): Dispatch => {
  const env = process.env.NODE_ENV

  if (env === 'development' && !has('pathlessRoute')) {
    throw new Error(
      '[rudy] "pathlessRoute" middleware is required to use "changeBasename" action creator without passing an action.',
    )
  }

  const { type, params, query, state, hash } = getLocation()
  const { basename } = action.payload

  return dispatch({ type, params, query, state, hash, basename })
}
