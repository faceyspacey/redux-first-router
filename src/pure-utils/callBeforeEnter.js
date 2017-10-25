// @flow
import redirect from '../action-creators/redirect'
import pathnamePlusSearch from './pathnamePlusSearch'
import isPromise from './isPromise'
import isServer from './isServer'
import type {
  Route,
  Store,
  RoutesMap,
  StandardCallback,
  Action
} from '../flow-types'

// NOTE ON RETURNING PROMISES FROM `beforeEnter`:
// A) `beforeEnter` when returning a promise triggers the action that does
// not redirect triggers the action to be re-dispatched and run through the
// middleware a second time after the promise resolves!
//
// B) `beforeEnter` should not be called again if it's the second time running
// through the middleware.
//
// C) WHY? This prevents infinite looping through the `beforeEnter` handler.
//
// D) If it does redirect, we need to run `beforeEnter` on the next route too,
// but it's different because we are starting fresh!. We can run through it all again.
//
// SUMMARY: Essentially we are using the middleware to re-dispatch the
// same action after it passes any filters the user might put in `beforeEnter`.
// The first time through, the action passes through the `if` block guarded with
// `!tempVals.beforeEnterHappenedAlready`, and the second time, it skips over and
// picks up where it left off.

export default (
  store: Store,
  route: Route,
  action: Action,
  routesMap: RoutesMap,
  tempVals: Object,
  currentPath: string,
  extra: any,
  beforeEnter: ?StandardCallback
): Promise<any> | void => {
  const routeBeforeChange = typeof route === 'object' && route.beforeEnter
  const hasBeforeChange = beforeEnter || routeBeforeChange
  const { dispatch, getState } = store
  const location = action.meta.location

  // A) CALL BEFORE_ENTER IF FIRST TIME ACTION GOES THROUGHT MIDDLEWARE
  if (hasBeforeChange && !tempVals.beforeEnterHappenedAlready) {
    let skip
    let redirectThunkReturn

    // 1) CREATE REDIRECT-AWARE DISPATCH
    const disp = (action: Action) => {
      const route = routesMap[action.type]
      const isRedirect = typeof route === 'object' && route.path

      // automatically treat dispatch to another route as a redirect
      if (isRedirect) {
        skip = true
        action = redirect(action)
        const nextPath = pathnamePlusSearch(location.current)
        const isHistoryChange = nextPath === currentPath

        // this insures a `history.push` is called instead of `history.replace`
        // even though it's a redirect, since unlike route changes triggered
        // from the browser buttons or redirects in thunks, the URL did not change yet.
        if (!isHistoryChange && !isServer()) {
          tempVals.beforeEnter = true
        }

        // will SKIP this action and dispatch will return thunk of new route
        return (redirectThunkReturn = dispatch(action))
      }

      return dispatch(action)
    }

    // 2) PREPAPRE + CALL `beforeEnter`
    const bag = { action, ...extra }
    const p1 = beforeEnter && beforeEnter(disp, getState, bag)
    const p2 = routeBeforeChange && routeBeforeChange(disp, getState, bag)
    const promAll = (isPromise(p1) || isPromise(p2)) && Promise.all([p1, p2])

    // 3) HANDLE BEFORE_ENTER PROMISES
    if (promAll) {
      return promAll.then(() => {
        if (!skip) {
          tempVals.beforeEnterHappenedAlready = true
          return dispatch(action) // no redirect, but we need to perform re-dispatch
        }

        return redirectThunkReturn // redirect during promise resolution; resolve to new route
      })
    }

    // 3) HANDLE BEFORE_ENTER THAT DOESN'T RETURN PROMISES
    if (skip) return redirectThunkReturn // short-circuit if a redirect
  }

  // B) SKIP ABOVE IF 2ND TIME THROUGH MIDDLEWARE (BY RETURNING NOTHING, MIDDLEWARE CONTINUES TO THUNK/ON_COMPLETE/ETC)
  // iv. the re-dispatch will pick up below this line the 2nd time through the middleware
  // NOTE: this will also prevent the re-dispatch if a user quickly triggers the dispatch of another route, which is the correct UE
  tempVals.beforeEnterHappenedAlready = false
}
