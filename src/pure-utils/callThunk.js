// @flow
import redirect from '../action-creators/redirect'
import callOnComplete from './callOnComplete'
import isPromise from './isPromise'

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
  routesMap: RoutesMap,
  thunk: ?StandardCallback,
  onComplete: ?StandardCallback
): Promise<any> | any => {
  const routeThunk = typeof route === 'object' && route.thunk
  const hasThunk = thunk || routeThunk

  if (!hasThunk) {
    callOnComplete(store, route, action, bag, onComplete)
    return
  }

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

  const p1 = thunk && thunk(disp, getState, bag)
  const p2 = routeThunk && routeThunk(disp, getState, bag)
  const promAll = (isPromise(p1) || isPromise(p2)) && Promise.all([p1, p2])

  if (promAll) {
    return promAll.then(([globalThunkReturn, routeThunkReturn]) => {
      if (!skip) {
        callOnComplete(store, route, action, bag, onComplete)
        return routeThunkReturn || globalThunkReturn
      }

      return redirectThunkReturn
    })
  }

  // return whatever synchronous thunks return
  // if nothing, the action itself will be returned from `dispatch` as always
  return p2 || p1
}
