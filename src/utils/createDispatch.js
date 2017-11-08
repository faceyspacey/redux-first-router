import redirect from '../action-creators/redirect'

export default (getReq) => action => {
  const req = getReq()
  const { store, routesMap } = req
  const route = routesMap[action.type]
  const isRedirect = typeof route === 'object' && route.path // can't be a pathless thunk

  if (isRedirect && !req.completed) {
    action = redirect(action, 302, false)
    req.temp.prev = req.action // if multiple redirects in one pass, the latest last redirect becomes prev
    return req.redirect = store.dispatch(action) // assign redirect action to req.redirect so composePromise can properly return the new action
  }
  else if (req.completed) {
    // delete the location in case `dispatch` is used outside of pipline
    // e.g. if beforeLeave returned false, and `dispatch` escaped the closure and
    // was used to re-dispatch an action in a confirm-leave modal. This way
    // it goes through the pipeline as normal, and isn't immediately sent through
    // the rest of the redux middleware after `shouldTransition` returns `false`
    delete action.meta.location
  }

  return store.dispatch(action)
}

