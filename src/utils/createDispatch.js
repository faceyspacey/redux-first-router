import redirect from '../action-creators/redirect'
import isRedirect from '../utils/isRedirect'

export default (getReq) => (action) => {
  const req = getReq() // get full req object from closure, since both are defined at same time
  const { store, routes } = req

  if (req.isAnonymousThunk) return store.dispatch(action)

  const route = routes[action.type]
  const isSwitchingRoutes = typeof route === 'object' && route.path // can't be a pathless thunk

  req.manuallyDispatched = true // tell `middleware/call.js` to not automatically dispatch callback returns

  if (isSwitchingRoutes && !req.completed) {
    action = redirect(action, 302)

    // honor committed status of context and incoming redirects, but don't let redirects during pipeline dictate committed status
    // this allows for properly determining whether to push or replace/redirect on the `history.entries` array.
    // (see `isCommittedRedirect()` call in `middleware/createRouteAction.js`)
    action.meta.location.committed = req.ctx.committed || isRedirect(req.ctx.startAction)

    req.tmp.prev = req.action.meta.location.current // if multiple redirects in one pass, the latest last redirect becomes prev
    return req.redirect = store.dispatch(action)    // assign redirect action to req.redirect so composePromise can properly return the new action
  }
  else if (req.completed) {
    // delete the location in case `dispatch` is used outside of pipline
    // e.g. if beforeLeave returned false, and `dispatch` escaped the closure and
    // was used to re-dispatch an action in a confirm-leave modal. This way
    // it goes through the pipeline as normal, and isn't immediately sent through
    // the rest of the redux middleware after `shouldTransition` returns `false`
    if (action.meta) delete action.meta.location
  }

  return store.dispatch(action)
}

