// @flow
import type { Store, Route, Bag, StandardCallback } from '../flow-types'

import isServer from './isServer'
import changePageTitle from './changePageTitle'
import {
  selectLocationState,
  selectTitleState,
  updateScroll
} from '../connectRoutes'

export default (
  store: Store,
  route: Route,
  bag: Bag,
  scrollTop: ?boolean,
  onBackNext: ?StandardCallback,
  onEnter: ?StandardCallback,
  onLeave: ?StandardCallback
) => {
  if (isServer()) return

  const { dispatch, getState } = store
  const state = store.getState()

  const locationState = selectLocationState(state)

  const routeOnLeave = typeof route === 'object' && route.onLeave
  const routeOnEnter = typeof route === 'object' && route.onEnter

  if (onLeave) {
    const onLeaveBag = { ...bag, action: locationState.prev }
    onLeave(dispatch, getState, onLeaveBag)
  }

  if (routeOnLeave) {
    const onLeaveBag = { ...bag, action: locationState.prev }
    routeOnLeave(dispatch, getState, onLeaveBag)
  }

  if (onEnter) {
    onEnter(dispatch, getState, bag)
  }

  if (routeOnEnter) {
    routeOnEnter(dispatch, getState, bag)
  }

  const title = selectTitleState(state)
  const { kind } = locationState

  if (typeof onBackNext === 'function' && kind && /back|next|pop/.test(kind)) {
    onBackNext(dispatch, getState, bag)
  }

  changePageTitle(window.document, title)

  setTimeout(() => {
    if (scrollTop) return window.scrollTo(0, 0)
    updateScroll(false)
  })
}
