// @flow
import { UPDATE_HISTORY } from '../types'
import { redirect } from '../actions'
import { isRedirect, noOp } from '../utils'

export default (
  action,
  api,
  next
) => new Request(action, api, next)

class Request {
  constructor(action, api, next) {
    const { store, routes, options, getLocation, ctx } = api
    const route = routes[action.type] || {}

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
    this.prevRoute = routes[getLocation().type]
    this.initialState = store.getState()
    this.initialLocation = getLocation()
    this.completed = false
    this.error = null

    this.commitHistory = this.action.type === UPDATE_HISTORY ? this.action.commit : noOp
    this.commitDispatch = next

    this.getState = store.getState
  }

  confirm = (shouldDispatch = true) => {
    if (!shouldDispatch) return

    this.action.location.force = 'beforeLeave'  // bypass `beforeLeave` returning `false` + force through pipeline again (see `shouldCall`, `isTransformed`, `shouldTransition`)
    return this.store.dispatch(this.action)
  }

  dispatch = (action) => {
    const { dispatch } = this.store
    const route = this.routes[action.type]

    this._dispatched = true                      // tell callbacks to not automatically dispatch callback returns

    if (route || typeof action === 'function') {
      action.tmp = this.tmp                      // keep the same `tmp` object across all redirects (or potential redirects in anonymous thunks)
    }

    if (this.ctx.busy && route && route.path) {  // convert actions to redirects only if "busy" in a route changing pipeline
      const status = action.location && action.location.status
      action = redirect(action, status || 302)  // automatically treat dispatches to routes during pipeline as redirects
      return this.redirect = dispatch(action)    // assign redirect action to `this.redirect` so `composePromise` can properly return the new action
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
}
