// @flow
import type { Route, Store, Bag, StandardCallback, Action } from '../flow-types'

export default (
  store: Store,
  route: Route,
  action: Action,
  bag: Bag,
  onAfterChange: ?StandardCallback,
  onBackNext: ?StandardCallback
) => {
  const routeAfterChange = typeof route === 'object' && route.onAfterChange
  const { dispatch, getState } = store

  if (onAfterChange) {
    onAfterChange(dispatch, getState, bag)
  }

  if (routeAfterChange) {
    routeAfterChange(dispatch, getState, bag)
  }
}
