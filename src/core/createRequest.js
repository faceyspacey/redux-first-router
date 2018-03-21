import { BLOCK, UNBLOCK, SET_FROM } from '../types'
import { redirect } from '../actions'
import { createAction } from '../utils'
import { createActionReference } from '../middleware/transformAction/utils'

export default (
  action,
  api,
  next
) => new Request(action, api, next)

export class Request {
  constructor(action, api, next) {
    const { routes, options, getLocation, ctx } = api
    const isNewPipeline = !action.tmp
    const pendingRequest = ctx.pending
    const { kind, type, prev } = getLocation()
    const route = routes[action.type] || {}
    const isRouteAction = !!route.path
    const prevRoute = kind === 'init' ? routes[prev.type] || {} : routes[type]

    // the `tmp` context is passed along by all route-changing actions in the same primary parent
    // pipeline to keep track of things like `committed` status, but we don't want the
    // resulting action that leaves Rudy to have this, so we delete it.
    const tmp = this.tmp = action.tmp || {}
    delete action.tmp // delete it so it's never seen outside of pipeline

    tmp.load = tmp.load || (action.location && action.location.kind === 'load')
    ctx.busy = ctx.busy || isRouteAction // maintain `busy` status throughout a primary parent route changing pipeline even if there are pathlessRoutes, anonymousThunks (which don't have paths) called by them

    // cancel pending not committed requests if new ones quickly come in
    if (isRouteAction) {
      if (pendingRequest && isNewPipeline) {
        pendingRequest.tmp.cancelled = true // `compose` will return early on pending requests, effectively cancelling them
        pendingRequest.tmp.revertPop && pendingRequest.tmp.revertPop() // cancel any actions triggered by browser pops
      }

      ctx.pending = this
    }

    Object.assign(this, options.extra)
    Object.assign(this, action) // destructure action into request for convenience in callbacks
    Object.assign(this, api, { dispatch: this.dispatch })

    this.action = action
    this.ctx = ctx
    this.route = route
    this.prevRoute = prevRoute
    this.error = null

    this.realDispatch = api.dispatch
    this.commitDispatch = next // standard redux next dispatch from our redux middleware
    this.commitHistory = action.commit // commitHistory is supplied by history-generated actions. Otherwise it will be added soon by the `transformAction` middleware

    // available when browser back/next buttons used. It's used in 3 cases:
    // 1) when you return `false` from a route triggered by the browser back/next buttons (See `core/compose.js`)
    // 2) in `transformAction/index.js` when popping to a route that redirects to the current URL (yes, we're on top of edge cases!)
    // 3) when a pop-triggered action is canceled (see above)
    this.tmp.revertPop = this.tmp.revertPop || action.revertPop
  }

  enter = () => {
    this.ctx.pending = false
    this.tmp.committed = true
    this.history.pendingPop = null

    return Promise.all([
      this.commitDispatch(this.action),
      this.commitHistory && this.commitHistory(this.action)
    ]).then(([res]) => res)
  }

  dispatch = (action) => {
    const dispatch = this.realDispatch
    const type = action && action.type
    const route = this.routes[type]
    const isRouteAction = route && route.path

    if (route || typeof action === 'function') {
      action.tmp = this.tmp                      // keep the same `tmp` object across all redirects (or potential redirects in anonymous thunks)

      if (this.ctx.busy) {
        // keep track of previous action to properly replace instead of push during back/next redirects
        // see `middleware/transformAction/utils/reduxAction.js`
        action.tmp.prevAction = this.tmp.prevAction || this.action
      }
    }

    if (this.ctx.busy && isRouteAction) { // convert actions to redirects only if "busy" in a route changing pipeline
      const status = action.location && action.location.status
      action = redirect(action, status || 302)
    }

    if (typeof action !== 'function') {
      if (!this._start) {
        action = createAction(action, this)       // automatically turn payload-only actions into real actions with routeType_COMPLETE|_DONE as type
      }
      else if (this._start) {
        // a callback immediately before `enter` has the final action/payload dispatched attached
        // to the payload of the main route action, to limit the # of actions dispatched.
        // NOTE: requires this middleware: `[call('beforeThunk', { start: true }), enter]`
        this.action.payload = action
        return Promise.resolve(action)
      }
    }

    const oldUrl = this.getLocation().url

    return Promise.resolve(dispatch(action))    // dispatch transformed action
      .then(res => {
        if (oldUrl !== this.getLocation().url || this.ctx.serverRedirect) {
          this.redirect = res                   // assign action to `this.redirect` so `compose` can properly short-circuit route redirected from and resolve to the new action (NOTE: will capture nested pathlessRoutes + anonymousThunks)
        }

        if (res) res._dispatched = true // tell `middleware/call/index.js` to NOT automatically dispatch callback returns

        return res
      })
  }

  confirm = (canLeave = true) => {
    delete this.ctx.confirm

    if (!canLeave) {
      return this.realDispatch({ type: UNBLOCK })
    }

    // When `false` is returned from a `call` middleware, you can use `req.confirm()` or the corresponding action
    // creator to run the action successfully through the pipeline again, as in a confirmation modal.
    // All we do is temporarily delete the blocking callback and replace it after the action
    // is successfully dispatched.
    //
    // See `middleware/call/index.js` for where the below assignments are made.
    const { name, prev } = this.last
    const route = prev ? this.prevRoute : this.route
    const callback = route[name]

    delete route[name]

    return this.realDispatch(this.action)
      .then(res => {
        route[name] = callback // put callback back
        if (res) res._dispatched = true
        return res
      })
  }

  block = () => {
    this.ctx.confirm = this.confirm
    const ref = createActionReference(this.action)
    return this.realDispatch({ type: BLOCK, payload: { ref } })
  }

  setFrom = () => {
    const ref = createActionReference(this.action)
    return this.realDispatch({ type: SET_FROM, payload: { ref } })
  }

  getKind = () => {
    if (this.tmp.load) return 'load'
    return this.action.location && this.action.location.kind
  }

  isUniversal = () => {
    return this.getLocation().universal
  }
}
