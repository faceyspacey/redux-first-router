import { UPDATE_HISTORY, BLOCK, UNBLOCK } from '../types'
import { redirect } from '../actions'
import { isRedirect, noOp } from '../utils'
import { createFrom } from '../middleware/transformAction/utils'

export default (
  action,
  api,
  next
) => new Request(action, api, next)

export class Request {
  constructor(action, api, next) {
    const { store, routes, options, getLocation, ctx } = api
    const state = getLocation()
    const route = routes[action.type] || {}
    const prevRoute = state.kind === 'init'
      ? routes[state.prev.type] || {}
      : routes[state.type]

    // cancel pending not committed requests if new ones quickly come in
    if (route.path) {
      const requestNotCommitted = ctx.pending
      const isNewPipeline = !action.tmp

      if (requestNotCommitted && isNewPipeline) {
        requestNotCommitted.cancelled = true // `compose` will return early on pending requests, effectively cancelling them
      }

      ctx.pending = this
    }

    // the `tmp` context is passed along by all actions in the same primary parent
    // pipeline to keep track of things like `committed` status, but we don't want the
    // resulting action that leaves Rudy to have this, so we delete it.
    const tmp = action.tmp || {}
    delete action.tmp

    // a `committed` status must be marked for redirects initiated outside of the pipeline
    // so that `src/middleware/transformAction/reduxAction.js` knows to `replace` the
    // history entry instead of `push`
    if (!ctx.busy && isRedirect(action)) {
      tmp.committed = true
    }

    // maintain `busy` status throughout a primary parent route changing pipeline even if
    // there are pathlessRoutes, anonymousThunks (which don't have paths) called by them
    ctx.busy = ctx.busy || !!route.path || action.type === UPDATE_HISTORY

    Object.assign(this, options.extra)
    Object.assign(this, api)

    this.action = action
    this.tmp = tmp
    this.ctx = ctx
    this.route = route
    this.prevRoute = prevRoute
    this.initialState = store.getState()
    this.initialLocation = state
    this.error = null

    // commitHistory is supplied by history-generated actions, and by redux-generated actions
    // it will be added by the `transformAction` middleware, overwriting `noOp` below
    this.commitHistory = this.action.type === UPDATE_HISTORY ? this.action.commit : noOp
    this.commitDispatch = next

    this.getState = store.getState
  }

  commit = () => {
    const res = this.commitDispatch(this.action)
    this.commitHistory()
    this.ctx.pending = false
    this.tmp.committed = true
    return res
  }

  dispatch = (action) => {
    const { dispatch } = this.store
    const route = this.routes[action.type]

    if (route || typeof action === 'function') {
      action.tmp = this.tmp                      // keep the same `tmp` object across all redirects (or potential redirects in anonymous thunks)
    }

    if (this.ctx.busy && route && route.path) { // convert actions to redirects only if "busy" in a route changing pipeline
      const status = action.location && action.location.status
      action = redirect(action, status || 302)  // automatically treat dispatches to routes during pipeline as redirects
      return this.redirect = dispatch(action)   // assign redirect action to `this.redirect` so `compose` can properly return the new action
        .then(markAsDispatched)
    }
    else if (route && route.path) {
      return this.redirect = dispatch(action)   // pathless routes entered by themselves still need to short-circuit middleware, and follow the new action, but without a redirect
        .then(markAsDispatched)
    }

    const oldUrl = this.getLocation().url

    return Promise.resolve(dispatch(action))    // dispatch transformed action
      .then(res => {
        if (oldUrl !== this.getLocation().url || this.ctx.serverRedirect) {
          this.redirect = res                    // capture redirects in nested calls to anonymousThunks + pathlessRoute
        }

        return markAsDispatched(res)
      })
  }

  confirm = (canLeave = true) => {
    delete this.ctx.confirm

    if (!canLeave) {
      return this.store.dispatch({ type: UNBLOCK })
    }

    // When `false` is returned from a `call` middleware, you can use `req.confirm()`
    // to run the action successfully through the pipeline again, as in a confirmation modal.
    // All we do is temporarily delete the blocking callback and replace it after the action
    // is successfully dispatched.
    //
    // See `middleware/call/index.js` for where the below assignments are made.
    const { name, prev } = this.last
    const route = prev ? this.prevRoute : this.route
    const callback = route[name]

    delete route[name]

    return this.store.dispatch(this.action)
      .then(res => {
        route[name] = callback // put callback back
        return res
      })
  }

  block = () => {
    this.ctx.confirm = this.confirm
    const ref = createFrom(this.action)
    return this.store.dispatch({ type: BLOCK, payload: { ref } })
  }

  getKind = () => {
    return this.action.location && this.action.location.kind
  }

  hasSSR = () => {
    return this.getLocation().hasSSR
  }
}

const markAsDispatched = res => {
  if (res && typeof res === 'object') {
    res._dispatched = true // tell `middleware/call/index.js` to not automatically dispatch callback returns
  }
  return res
}
