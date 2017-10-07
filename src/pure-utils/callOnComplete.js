// @flow
import type { Route, Store, Bag, StandardCallback, Action } from '../flow-types'
import { updateScroll } from '../connectRoutes'

export default (
  store: Store,
  route: Route,
  action: Action,
  bag: Bag,
  onComplete: ?StandardCallback
) => {
  const routeAfterChange = typeof route === 'object' && route.onComplete
  const { dispatch, getState } = store

  if (onComplete) {
    onComplete(dispatch, getState, bag)
  }

  if (routeAfterChange) {
    routeAfterChange(dispatch, getState, bag)
  }

  updateScroll(false)
}
