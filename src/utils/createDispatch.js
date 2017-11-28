import { isRedirect, isTransformed } from './index'
import { redirect } from '../actions'

export default (getReq) => (action) => {
  const req = getReq() // get full req object from closure, since both are defined at same time
  const { store, routes } = req
  const route = routes[action.type]
  const isPathlessThunk = !route || !route.path                   // routes are not actually changing if route has no `path` (aka "pathless thunks")
  const fromShortCircuitingPhase = !isTransformed(req.action)  // middleware like `anonymousThunk` dispatch early (before "pipeline phase") and need to go back through middleware normally
  const isSwitchingRoutes = !isPathlessThunk && !fromShortCircuitingPhase

  req._dispatched = true // tell `middleware/call.js` + middleware/anonymousThunk.js` to not automatically dispatch callback returns

  if (isSwitchingRoutes && !req.completed) {
    const status = action.location && action.location.status
    action = redirect(action, status || 302)

    // HISTORY ENTRIES PUSH/REPLACE LOGIC:
    //
    // The following allows for determining whether to push or redirect (aka "replace") on the `history.entries` array.
    //
    // The goal is to honor both `tmp.committed` and incoming redirects (prior to pipeline), but without letting
    // redirects during the pipeline dictate committed status, as it can result in replacing the previous entry.
    // Real replacing in the form of redirects is only at the discretion of the user outside of the pipeline.
    //
    // Once the pipeline starts, there is at least one new entry already being attempted to be pushed. So redirects
    // during the pipeline make the decision whether the redirect results in a replace (after comitting) or an
    // ALTERNATE PUSH (before committing).
    //
    // See the following files for additional info on the logic:
    //
    // - utils/isCommittedRedirect.js
    // - actions/redirect.js
    // - middleware/transformAction.js -- look for call to `isCommittedRedirect`
    action.location.committed = req.tmp.committed || isRedirect(req.tmp.startAction)

    req.tmp.prev = req.action.location // if multiple redirects in one pass, the latest redirect becomes `prev`
    return req.redirect = store.dispatch(action)    // assign redirect action to `req.redirect` so `composePromise` can properly return the new action
  }
  else if (req.completed) {
    // ESCAPED `dispatch` (USE CASE: CONFIRM LEAVE MODAL)
    //
    // Delete the location in case `dispatch` is used outside of pipline.
    //
    // The use case is if `beforeLeave` returned `false`, and `dispatch` escaped the closure
    // and was used to re-dispatch an action in a modal (or other UI component) confirming
    // the user's intent to leave.
    //
    // This way it goes through the pipeline as normal, and isn't immediately sent through
    // the rest of the redux middleware after `shouldTransition` returns `false`. The reason
    // is because `shouldTransition` calls `isTransformed(action)` to determine whether
    // the action already passed through the pipeline based on the presence of this key. The
    // value of this key will be re-built by the pipeline on next pass obviously :)
    delete action.location
  }

  return store.dispatch(action) // dispatch transformed action
}

