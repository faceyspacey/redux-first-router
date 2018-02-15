import { UPDATE_HISTORY } from '../../types'

import {
  urlToAction,
  actionToUrl,
  isNotFound
} from '../../utils'

import {
  historyAction,
  reduxAction,
  createNotFoundRoute
} from './utils'

export default (api) => async (req, next) => {
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
      const act = urlToAction(location, routes, options)
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
    const params = (action && action.params) || {}
    const act = { ...action, type, params }
    req = reduxAction(req, url, act, history)
  }

  // `setState` needs to skip the callbacks of the middleware pipeline and go straight to the reducer.
  // Also, `setState` kind will have the same URL, so we must handle it before `isDoubleDispatch`.
  if (req.action.location.kind === 'setState') {
    return req.commit()
  }

  const currentState = getLocation()
  if (isDoubleDispatch(req, currentState)) return req.action

  const { type, params, query, hash, state } = req.action
  Object.assign(req, { type, params, query, hash, state })

  req.tmp.from = req.action // record attempted route for potential redirects

  await next()
  return req.action
}

const isDoubleDispatch = (req, state) =>
  req.action.location.url === state.url
  && state.kind !== 'init' // on load, the `firstRoute` action will trigger the same URL as stored in state, and we need to dispatch it anyway :)
  && req.action.info !== 'reset'
