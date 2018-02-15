// @flow
import { UPDATE_HISTORY, BLOCK, UNBLOCK } from '../types'
import { redirect } from '../actions'
import { isRedirect, noOp } from '../utils'
import { createFrom } from '../middleware/transformAction/utils'

export default (
  action,
  api,
  next
) => new Request(action, api, next)

class Request {
  constructor(action, api, next) {
    const { store, routes, options, getLocation, ctx } = api
    const state = getLocation()
    const route = routes[action.type] || {}
    const prevRoute = state.kind === 'init'
      ? routes[state.prev.type] || {}
      : routes[state.type]

    if (route.path) {
      if (ctx.pending && !action.tmp) {
        // ctx.cancelled = true
      }
      // ctx.pending = true
    }

    const tmp = action.tmp || {}
    delete action.tmp

    if (!ctx.busy && isRedirect(action)) {
      tmp.committed = true
    }

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
    this.completed = false
    this.error = null

    this.commitHistory = this.action.type === UPDATE_HISTORY ? this.action.commit : noOp
    this.commitDispatch = next

    this.getState = store.getState
  }

  getKind = () => {
    return this.action.location && this.action.location.kind
  }

  commit = () => {
    const res = this.commitDispatch(this.action)
    this.commitHistory()
     // req.ctx.pending = false
    this.tmp.committed = true
    return res
  }

  dispatch = (action) => {
    const { dispatch } = this.store
    const route = this.routes[action.type]

    this._dispatched = true                      // tell callbacks to not automatically dispatch callback returns

    if (route || typeof action === 'function') {
      action.tmp = this.tmp                      // keep the same `tmp` object across all redirects (or potential redirects in anonymous thunks)
    }

    if (this.ctx.busy && route && route.path) { // convert actions to redirects only if "busy" in a route changing pipeline
      const status = action.location && action.location.status
      action = redirect(action, status || 302)  // automatically treat dispatches to routes during pipeline as redirects
      return this.redirect = dispatch(action)   // assign redirect action to `this.redirect` so `composePromise` can properly return the new action
    }

    const oldUrl = this.getLocation().url

    return Promise.resolve(dispatch(action))    // dispatch transformed action
      .then(res => {
        if (oldUrl !== this.getLocation().url || this.ctx.serverRedirect) {
          this.redirect = res                    // capture redirects in nested calls to anonymousThunks + pathlessRouteThunks
        }

        return res
      })
  }

  confirm = (canLeave?: boolean = true) => {
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

    // this.action.location.blocked = true
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
}
