// @flow

import pathToAction from './pathToAction'
import isPromise from './isPromise'
import isServer from './isServer'
import { selectLocationState, getOptions, history } from '../connectRoutes'
import type {
  Action,
  HistoryLocation,
  Location,
  Store,
  Route,
  BeforeLeave
} from '../flow-types'

let _unblock
let _confirm

export const clearBlocking = () => {
  _unblock && _unblock()
  _unblock = null
  _confirm = null
}

// A) CALLED IN `beforeEnter` WHEN LEAVING ROUTES THAT HAVE `beforeLeave` OPTION
export default (location: Location) => _confirm && _confirm(location)

// B) THIS IS CALLED IN `onComplete` OF ROUTES THAT HAVE `beforeLeave` OPTION.
//
// 1) `setConfirm` is called whenever you enter a route that has a `beforeLeave`
// option.
//
// 2) It tells the history package to block via `history.block`, but
// to determine to do so based on our redux state-centric `beforeLeave` handler.
//
// 3) If `beforeLeave` returns `false`, the current route won't be left. The user
// can show their own custom UI however they want (presumably by dispatching
// an action that triggers a model). Then when they want, they can dispatch
// the action in the 3rd bag argument if confirmed, or any action they want.
//
// 4) The `_confirm` handler is also returned for use in the middleware to block when
// leaving the current route via actions (i.e. as opposed to browser buttons)
//
// 5) in all cases, `clearBlocking` is called once the route is successfully left
// so that there is no more blocking until another route sets up the same.

export const setConfirm = (
  store: Store,
  route: Route,
  beforeLeave: ?BeforeLeave
) => {
  if (isServer()) return

  const rBeforeLeave = typeof route === 'object' && route.beforeLeave
  const hasBeforeLeave = beforeLeave || rBeforeLeave

  if (!hasBeforeLeave) return

  _confirm = (location: HistoryLocation | Location, historyAction?: string) => {
    const isFromHistory = !!historyAction
    const { dispatch, getState } = store
    const { querySerializer, extra } = getOptions()
    const pathname = location.pathname
    const state = getState()
    const locationState = selectLocationState(state)
    const initialType = locationState.type
    const routesMap = locationState.routesMap
    const action = pathToAction(pathname, routesMap, querySerializer)
    const bag = { action, ...extra }

    const disp = (action: Action) => {
      const isRouteAction = routesMap[action.type]
      if (isRouteAction) clearBlocking()
      return dispatch(action)
    }

    const p1 = beforeLeave ? beforeLeave(disp, getState, bag) : undefined
    const p2 = rBeforeLeave ? rBeforeLeave(disp, getState, bag) : undefined
    const promAll = (isPromise(p1) || isPromise(p2)) && Promise.all([p1, p2])

    // setup the promise to re-dispatch the action if it doesn't resolve to false
    if (promAll) {
      const prom = promAll.then(([p1, p2]) => {
        const canLeave = p1 !== false && p2 !== false

        if (!canLeave) return false
        clearBlocking()

        // insure we're not unnecessarily dispatching, as user might have done so manually.
        // and they possibly might have decided to dispatch a different route
        const state = selectLocationState(getState())

        return state.type === initialType ? dispatch(action) : p2 || p1 // return regular return of beforeLeave
      })

      // history changes need to be returned false; and the promise will resolve itself
      if (isFromHistory) return false
      return prom // the middleware gets the promise so you can await it where you dispatch should you choose
    }

    const canLeave = p1 !== false && p2 !== false

    // clear blocking so next route isn't blocked by confirmation dialog
    if (canLeave) clearBlocking()

    // if called from history, return possibly false to block.
    // if called from middleware, return truthy to skip; that way truthy promises can also be returned as above.
    return isFromHistory ? canLeave : !canLeave
  }

  _unblock = history().block(_confirm)
}
