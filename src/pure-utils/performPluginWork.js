// @flow
import type { Store, Bag, StandardCallback } from '../flow-types'

import isServer from './isServer'
import changePageTitle from './changePageTitle'
import {
  selectLocationState,
  selectTitleState,
  updateScroll
} from '../connectRoutes'

export default (
  store: Store,
  bag: Bag,
  onBackNext: ?StandardCallback,
  scrollTop: ?boolean
) => {
  if (isServer()) return

  const { dispatch, getState } = store
  const state = store.getState()
  const title = selectTitleState(state)
  const { kind } = selectLocationState(state)

  if (kind) {
    if (typeof onBackNext === 'function' && /back|next|pop/.test(kind)) {
      onBackNext(dispatch, getState, bag)
    }

    setTimeout(() => {
      changePageTitle(window.document, title)
      if (scrollTop) return window.scrollTo(0, 0)
      updateScroll(false)
    })
  }
}
