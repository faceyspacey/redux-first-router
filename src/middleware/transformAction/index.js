import { UPDATE_HISTORY } from '../../types'
import { historyAction, reduxAction } from './utils'

export default () => (req, next) => {
  if (!isRouteAction(req)) return next()

  req = req.type === UPDATE_HISTORY ? historyAction(req) : reduxAction(req)

  if (req.getKind() === 'setState') return req.commit()
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



// import { UPDATE_HISTORY } from '../../types'

// import {
//   urlToAction,
//   actionToUrl,
//   isNotFound
// } from '../../utils'

// import {
//   historyAction,
//   reduxAction,
//   createNotFoundRoute
// } from './utils'

const old = (api) => async (req, next) => {
  const {
    route,
    routes,
    options,
    action,
    history,
    getLocation
  } = req

  if (action.type !== UPDATE_HISTORY && !route.path) {
    return next() // only create route actions if from history or routes with paths
  }

  try {
    if (action.type === UPDATE_HISTORY) {
      const { location } = action.nextHistory
      const loc = { ...location.location, ...location }
      const act = urlToAction(loc, routes, options)
      req = historyAction(req, act)
    }
    else if (!isNotFound(action)) {
      const url = actionToUrl(action, routes, options)
      req = reduxAction(req, url, action, history)
    }
    else {
      const { type, url } = createNotFoundRoute(req)
      action.type = type
      req = reduxAction(req, url, action, history)
    }
  }
  catch (e) {
    const { type, url } = createNotFoundRoute(req)
    req = reduxAction(req, url, { ...action, type }, history)
  }

  // `setState` needs to skip the callbacks of the middleware pipeline and go straight to the reducer.
  // Also, `setState` kind will have the same URL, so we must handle it before `isDoubleDispatch`.
  if (req.getKind() === 'setState') {
    return req.commit()
  }

  if (isDoubleDispatch(req, getLocation())) { // don't dispatch the same action twice
    req.ctx.pending = false
    console.log('DOUBLE DISPATCH', req.tmp.revertPop, req.tmp)
    req.history.pendingPop = null

    if (!req.tmp.prevAction) {
      return req.action // primary use case
    }

    req.ctx.doubleDispatchRedirect = req.action

    // and if it happens to be within a route-changing pipline that redirects,
    // insure the parent pipeline short-ciruits while setting `state.from` (see `call/index.js`)
    if (req.tmp.revertPop) req.tmp.revertPop()

    return req.action
  }

  const { type, params, query, hash, state, location } = req.action
  Object.assign(req, { type, params, query, hash, state, location })

  req.tmp.from = req.action // record attempted route for potential redirects

  await next()
  return req.action
}

// // on `load`, the `firstRoute` action will trigger the same URL as stored in state, and we need to dispatch it anyway :)
// // on `reset` or `jump`, the action must be allowed to be dispatched no matter what (these actions are programmer-triggered
// // and therefore far less likely to be the result of fast clicking/tapping; nothing would break if double-dispatched anyway;
// // it's just a minor optimization)
// const isDoubleDispatch = (req, state) =>
//   req.action.location.url === state.url && !/load|reset|jump/.test(req.getKind())
