// @flow
import { UPDATE_HISTORY } from '../types'
import { redirect } from '../actions'
import { isRedirect, noOp } from '../utils'

export default (
  action,
  api,
  tmp,
  next
) => {
  const { store, routes, options, getLocation, ctx } = api
  const route = routes[action.type] || {}

  if (!ctx.busy && isRedirect(action)) {
    tmp.committed = true
  }

  ctx.busy = ctx.busy || !!route.path || action.type === UPDATE_HISTORY

  const req = {
    ...options.extra,
    ...api,
    tmp,
    action,
    initialState: store.getState(),
    initialLocation: getLocation(),
    getState: store.getState,
    prevRoute: routes[getLocation().type],
    route,
    commitHistory: action.type === UPDATE_HISTORY ? action.commit : noOp,
    commitDispatch: next,
    completed: false,
    error: null
  }

  req.dispatch = createDispatch(req)
  req.confirm = createConfirm(req)

  return req
}

const createDispatch = (req) => (action) => {
  const { routes, getLocation, store: { dispatch } } = req
  const route = routes[action.type]

  req._dispatched = true                      // tell callbacks to not automatically dispatch callback returns
  action.tmp = req.tmp                        // keep the same `tmp` object across all redirects

  if (req.ctx.busy && route && route.path) {  // convert actions to redirects only if "busy" in a route changing pipeline
    const status = action.location && action.location.status
    action = redirect(action, status || 302)  // automatically treat dispatches to routes during pipeline as redirects
    return req.redirect = dispatch(action)    // assign redirect action to `req.redirect` so `composePromise` can properly return the new action
  }

  const oldUrl = getLocation().url

  return Promise.resolve(dispatch(action))    // dispatch transformed action
    .then(res => {
      if (oldUrl !== getLocation().url) {
        req.redirect = res                    // capture redirects in nested calls to anonymousThunks + pathlessRouteThunks
      }

      return res
    })
}


const createConfirm = (req) => () => {
  const { action, store: { dispatch } } = req
  action.location.force = 'beforeLeave'  // bypass `beforeLeave` returning `false` + force through pipeline again (see `shouldCall`, `isTransformed`, `shouldTransition`)
  return dispatch(req.action)
}
