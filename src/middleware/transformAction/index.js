import { UPDATE_HISTORY } from '../../types'
import { historyAction, reduxAction } from './utils'

export default () => (req, next) => {
  if (!isRouteAction(req)) return next()

  req = /jump|reset/.test(req.getKind()) ? historyAction(req) : reduxAction(req)

  if (req.getKind() === 'setState') return req.enter()
  if (isDoubleDispatch(req)) return handleDouble(req) // don't dispatch the same action twice

  const { type, params, query, hash, state, location } = req.action
  Object.assign(req, { type, params, query, hash, state, location }) // assign to `req` for conevenience (less destructuring in callbacks)
  req.tmp.from = req.action // record attempted route for potential redirects

  return next().then(() => req.action)
}

const handleDouble = (req) => {
  req.ctx.pending = false
  req.history.pendingPop = null

  if (!req.tmp.prevAction) return req.action // primary use case

  req.ctx.doubleDispatchRedirect = req.action // if it happens to be within a route-changing pipline that redirects,
  if (req.tmp.revertPop) req.tmp.revertPop() // insure the parent pipeline short-ciruits while setting `state.from` (see `call/index.js`)

  return req.action
}

const isRouteAction = (req) => req.type === UPDATE_HISTORY || req.route.path

const isDoubleDispatch = (req) =>
  req.action.location.url === req.getLocation().url && !/load|reset|jump/.test(req.getKind())

// on `load`, the `firstRoute` action will trigger the same URL as stored in state, and we need to dispatch it anyway :)
// on `reset` or `jump`, the action must be allowed to be dispatched no matter what (these actions are programmer-triggered
// and therefore far less likely to be the result of fast clicking/tapping; nothing would break if double-dispatched anyway;
// it's just a minor optimization)

