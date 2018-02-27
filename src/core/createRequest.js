import { UPDATE_HISTORY, BLOCK, UNBLOCK, SET_FROM } from '../types'
import { redirect } from '../actions'
import { isRedirect, noOp, createAction } from '../utils'
import { createFrom } from '../middleware/transformAction/utils'

export default (
  action,
  api,
  next
) => new Request(action, api, next)

export class Request {
  constructor(action, api, next) {
    const { store, routes, options, getLocation, ctx } = api
    const isNewPipeline = !action.tmp
    const pendingRequest = ctx.pending
    const fromHistory = action.type === UPDATE_HISTORY
    const state = getLocation()
    const route = routes[action.type] || {}
    const prevRoute = state.kind === 'init'
      ? routes[state.prev.type] || {}
      : routes[state.type]

    // the `tmp` context is passed along by all route-changing actions in the same primary parent
    // pipeline to keep track of things like `committed` status, but we don't want the
    // resulting action that leaves Rudy to have this, so we delete it.
    const tmp = this.tmp = action.tmp || {}
    delete action.tmp

    tmp.load = tmp.load || (fromHistory && action.nextHistory.kind === 'load')

    // a `committed` status must be marked for redirects initiated outside of the pipeline
    // so that `src/middleware/transformAction/reduxAction.js` knows to `replace` the
    // history entry instead of `push`
    if (!ctx.busy && isRedirect(action)) {
      tmp.committed = true
    }

    // maintain `busy` status throughout a primary parent route changing pipeline even if
    // there are pathlessRoutes, anonymousThunks (which don't have paths) called by them
    ctx.busy = ctx.busy || !!route.path || fromHistory

    // cancel pending not committed requests if new ones quickly come in
    if (route.path || fromHistory) {
      console.log('CHECK IF CANCELED', fromHistory ? action.nextHistory.location.url : action.type, isNewPipeline ? 'true - new pipeline' : 'pipeline redirect', pendingRequest)
      if (fromHistory && action.revertPop) {
        api.history.pendingPop = true
      }

      if (pendingRequest && isNewPipeline) {
        if (fromHistory && action.revertPop) {
          console.log('NEWEST HISTORY POP REVERT!!!!!!')
          this.tmp.cancelled = true
          action.revertPop(false)
        }
        else {
          pendingRequest.tmp.cancelled = true // `compose` will return early on pending requests, effectively cancelling them
          pendingRequest.revert()
        }
      }

      ctx.pending = this
    }

    Object.assign(this, options.extra)
    Object.assign(this, api)
    Object.assign(this, !fromHistory && action) // destructure action into request for convenience in callbacks

    this.action = action
    this.ctx = ctx
    this.route = route
    this.prevRoute = prevRoute
    this.initialState = store.getState()
    this.initialLocation = state
    this.error = null

    // commitHistory is supplied by history-generated actions, and by redux-generated actions
    // it will be added by the `transformAction` middleware, overwriting `noOp` below
    this.commitHistory = fromHistory ? action.commit : noOp
    this.commitDispatch = next // standard redux next dispatch from our redux middleware

    // available when browser back/next buttons used. It's used in 2 cases:
    // 1) when you return `false` from a route triggered by the browser back/next buttons (See `core/compose.js`)
    // 2) as a flag when you redirect from a route triggered by browser back/next buttons (see `middleware/transformAction/utils/reduxAction.js`)
    this.tmp.revertPop = this.tmp.revertPop || action.revertPop

    this.getState = store.getState
  }

  commit = () => {
    console.log('COMMIT!', this.type, this.params && this.params.category)
    this.ctx.pending = false
    this.tmp.committed = true
    this.history.pendingPop = false

    return Promise.all([
      this.commitDispatch(this.action),
      this.commitHistory()
    ]).then(([res]) => res)
  }

  revert = () => {
    if (this.tmp.revertPop) {
      console.log('REVERT!!!', this.type)
      this.tmp.revertPop(false)
    }
  }

  dispatch = (action) => {
    const { dispatch } = this.store
    const type = action && action.type
    const route = this.routes[type]

    if (route || typeof action === 'function') {
      action.tmp = this.tmp                      // keep the same `tmp` object across all redirects (or potential redirects in anonymous thunks)

      if (this.ctx.busy) {
        // keep track of previous action to properly replace instead of push during back/next redirects
        // see `middleware/transformAction/utils/reduxAction.js`
        action.tmp.prevAction = this.tmp.prevAction || this.action
      }
    }

    if (this.ctx.busy && route && route.path) { // convert actions to redirects only if "busy" in a route changing pipeline
      const status = action.location && action.location.status
      action = redirect(action, status || 302)
    }

    if ((action === null || !action.type) && typeof action !== 'function') {
      action = createAction(action, this)       // automatically turn payload-only actions into real actions with routeType_COMPLETE as type
    }

    const oldUrl = this.getLocation().url

    return Promise.resolve(dispatch(action))    // dispatch transformed action
      .then(res => {
        if (oldUrl !== this.getLocation().url || this.ctx.serverRedirect) {
          this.redirect = res                   // assign action to `this.redirect` so `compose` can properly short-circuit route redirected from and resolve to the new action (NOTE: will capture nested pathlessRoutes + anonymousThunks)
        }

        if (res && typeof res === 'object') {
          res._dispatched = true // tell `middleware/call/index.js` to not automatically dispatch callback returns
        }

        return res
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

  setFrom = () => {
    const ref = createFrom(this.action)
    return this.store.dispatch({ type: SET_FROM, payload: { ref } })
  }

  getKind = () => {
    return this.action.location && this.action.location.kind
  }

  isUniversal = () => {
    return this.getLocation().universal
  }
}
