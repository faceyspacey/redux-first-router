// @flow
import { updateScroll } from '../connectRoutes'
import redirect from '../action-creators/redirect'

import type {
  Route,
  Store,
  Bag,
  Action,
  RoutesMap,
  Dispatch,
  GetState,
  StandardCallback
} from '../flow-types'

export default (
  store: Store,
  route: Route,
  action: Action,
  bag: Bag,
  thunk: ?StandardCallback,
  routesMap: RoutesMap
): {
  skip?: boolean,
  retrn?: any
} => {
  if (typeof route !== 'object' || typeof route.thunk !== 'function') return {}

  const { dispatch, getState } = store

  let skip
  let redirectThunkReturn

  const disp = (action: Action) => {
    const isRedirect = routesMap[action.type]

    // automatically treat dispatch to another route as a redirect
    if (isRedirect) {
      skip = true
      action = redirect(action)
      return (redirectThunkReturn = dispatch(action))
    }

    return dispatch(action)
  }

  const thunkReturn = execThunk(disp, getState, route.thunk, bag)

  // A) If no redirect/skip, return result of regular thunk
  // B) If there was a redirect, do the same for the redirect action:
  const retrn = !skip ? thunkReturn : redirectThunkReturn

  return { skip, retrn }
}

export const execThunk = (
  dispatch: Dispatch,
  getState: GetState,
  thunk: StandardCallback,
  bag: Bag
) => {
  if (typeof thunk !== 'function') return

  const thunkReturn = thunk(dispatch, getState, bag)

  if (thunkReturn && typeof thunkReturn.next === 'function') {
    thunkReturn.next(updateScroll)
  }

  return thunkReturn
}
