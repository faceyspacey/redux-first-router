// @flow
import { BLOCK, UNBLOCK, SET_FROM, CALL_HISTORY } from '../types'
import { redirect } from '../actions'
import { isAction, createActionRef } from '../utils'
import type {
  ActionMetaLocation,
  Action,
  RequestAPI,
  Route,
  Routes,
  Dispatch,
} from '../flow-types'

export default (action: Action, api: RequestAPI, next: Function): Request =>
  new Request(action, api, next)

export class Request {
  tmp: Object

  action: Action

  ctx: Object

  route: Route

  prevRoute: Route

  error: null | boolean

  scene: string

  realDispatch: Dispatch

  commitDispatch: Dispatch | Function

  commitHistory: void | Function

  history: Object

  routes: Routes

  redirect: ActionMetaLocation

  getLocation: () => Object

  last: Object

  canceled: boolean

  type: string

  constructor(action: Action, api: RequestAPI, next: Function): void {
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
    const tmp = (this.tmp = action.tmp || {})
    delete action.tmp // delete it so it's never seen outside of pipeline

    tmp.load = tmp.load || (action.location && action.location.kind === 'load')
    ctx.busy = ctx.busy || isRouteAction // maintain `busy` status throughout a primary parent route changing pipeline even if there are pathlessRoutes, anonymousThunks (which don't have paths) called by them

    // cancel pending not committed requests if new ones quickly come in
    if (isRouteAction) {
      if (pendingRequest && isNewPipeline) {
        pendingRequest.tmp.canceled = true // `compose` will return early on pending requests, effectively cancelling them
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
    this.scene = route.scene || ''

    this.realDispatch = api.dispatch
    this.commitDispatch = next // standard redux next dispatch from our redux middleware
    this.commitHistory = action.commit // commitHistory is supplied by history-generated actions. Otherwise it will be added soon by the `transformAction` middleware

    // available when browser back/next buttons used. It's used in 3 cases:
    // 1) when you return `false` from a route triggered by the browser back/next buttons (See `core/compose.js`)
    // 2) in `transformAction/index.js` when popping to a route that redirects to the current URL (yes, we're on top of edge cases!)
    // 3) when a pop-triggered action is canceled (see above)
    this.tmp.revertPop = this.tmp.revertPop || action.revertPop
  }

  enter = (): Promise<any> => {
    this.ctx.pending = false
    this.tmp.committed = true
    this.history.pendingPop = null

    return Promise.resolve(this.commitDispatch(this.action)) // syncronous 99% percent of the time (state needs to be updated before history updates URL etc)
      .then((res) => {
        if (!this.commitHistory) return res
        return this.commitHistory(this.action).then(() => res)
      })
  }

  dispatch = (action: Object): Promise<any> => {
    const dispatch = this.realDispatch
    const type = action && action.type // actions as payloads (which can be `null`) allowed
    const route = this.routes[type]
    const linkPipelines = route || typeof action === 'function'

    if (linkPipelines) {
      action.tmp = this.tmp // keep the same `tmp` object across all redirects (or potential redirects in anonymous thunks)

      if (this.ctx.busy) {
        // keep track of previous action to properly replace instead of push during back/next redirects
        // while setting to `state.from`. See `middleware/transformAction/utils/formatAction.js`
        action.tmp.from = this.tmp.from || this.action
      }
    }

    if (
      this.ctx.busy &&
      route &&
      route.path && // convert actions to redirects only if "busy" in a route changing pipeline
      !(action.location && action.location.kind === 'set') // history `set` actions should not be transformed to redirects
    ) {
      const status = action.location && action.location.status
      action = redirect(action, status || 302)
    }

    if (typeof action !== 'function') {
      if (!this._start) {
        action = this.populateAction(action, this) // automatically turn payload-only actions into real actions with routeType_COMPLETE|_DONE as type
      } else if (this._start) {
        // a callback immediately before `enter` has the final action/payload dispatched attached
        // to the payload of the main route action, to limit the # of actions dispatched.
        // NOTE: requires this middleware: `[call('beforeThunk', { start: true }), enter]`
        this.action.payload = action
        return Promise.resolve(action)
      }
    }

    const oldUrl = this.getLocation().url

    return Promise.resolve(dispatch(action)) // dispatch transformed action
      .then((res) => {
        const urlChanged = oldUrl !== this.getLocation().url

        if (
          this.ctx.serverRedirect || // short-circuit when a server redirected is detected
          ((urlChanged || action.type === CALL_HISTORY) && // short-circuit if the URL changed || or history action creators used
            !(res && res.location && res.location.kind === 'set')) // but `set` should not short-circuit ever
        ) {
          this.redirect = res // assign action to `this.redirect` so `compose` can properly short-circuit route redirected from and resolve to the new action (NOTE: will capture nested pathlessRoutes + anonymousThunks)
        }

        if (res) res._dispatched = true // tell `middleware/call/index.js` to NOT automatically dispatch callback returns

        return res
      })
  }

  confirm = (canLeave: boolean = true): Dispatch => {
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

    return this.realDispatch(this.action).then((res) => {
      route[name] = callback // put callback back
      if (res) res._dispatched = true
      return res
    })
  }

  block = (): Dispatch => {
    this.ctx.confirm = this.confirm
    const ref = createActionRef(this.action)
    return this.realDispatch({ type: BLOCK, payload: { ref } })
  }

  getKind = () => {
    if (this.tmp.load) return 'load'
    return this.action.location && this.action.location.kind
  }

  isUniversal = () => this.getLocation().universal

  isDoubleDispatch = (): boolean =>
    this.action.location.url === this.getLocation().url &&
    !/load|reset|jump/.test(this.getKind()) // on `load`, the `firstRoute` action will trigger the same URL as stored in state; the others must always pass through

  handleDoubleDispatch = () => {
    this.ctx.pending = false
    this.history.pendingPop = null

    if (!this.tmp.from) return this.action // primary use case

    // below is code related to occuring during a redirect (i.e. because `this.tmp.from` exists)
    this.ctx.doubleDispatchRedirect = this.action // if it happens to be within a route-changing pipline that redirects, insure the parent pipeline short-circuits while setting `state.from` (see below + `call/index.js`)
    if (this.tmp.revertPop) this.tmp.revertPop()

    return this.action
  }

  handleDoubleDispatchRedirect = (res: Object) => {
    const attemptedAction = this.ctx.doubleDispatchRedirect
    delete this.ctx.doubleDispatchRedirect
    this.canceled = true

    const ref =
      this.action.type === CALL_HISTORY
        ? createActionRef(attemptedAction.location.from) // when history action creators are used in pipeline, we have to address this from the perspective of the `callHistory` middleware
        : createActionRef(this.action)

    this.realDispatch({ type: SET_FROM, payload: { ref } })

    return res !== undefined ? res : attemptedAction
  }

  populateAction = (act: Action) => {
    let type

    const action = isAction(act)
      ? act
      : typeof act === 'string' && (type = this.isActionType(act))
        ? { type }
        : { payload: act }

    action.type =
      action.type ||
      (this.tmp.committed ? `${this.type}_COMPLETE` : `${this.type}_DONE`)

    return action
  }

  isActionType = (str: string) => {
    if (this.routes[str]) return str
    if (this.routes[`${this.scene}/${str}`]) return str
    if (/^[A-Z0-9_/]+$/.test(str)) return str
    if (str.indexOf('@@') === 0) return str
  }
}
