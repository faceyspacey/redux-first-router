import { UPDATE_HISTORY } from '../../types'

import {
  urlToAction,
  actionToUrl,
  isNotFound
} from '../../utils'

import {
  historyAction,
  reduxAction,
  createNotFoundRoute,
  isDoubleDispatch
} from './utils'

export default (api) => async (req, next) => {
  const {
    route,
    routes,
    action,
    history,
    getLocation,
    options: { basename: bn }
  } = req

  if (action.type !== UPDATE_HISTORY && !route.path) return next() // only create route actions if from history or routes with paths

  const state = getLocation()
  const basename = state.basename || bn
  const prev = state.kind === 'init' ? state.prev : state

  try {
    if (action.type === UPDATE_HISTORY) {
      const { location } = action.nextHistory
      // const basename = location.basename
      const act = urlToAction(location, routes, basename)
      req = historyAction(req, act, prev, basename)
    }
    else if (!isNotFound(action)) {
      const url = actionToUrl(action, routes)
      req = reduxAction(req, url, action, prev, history, basename)
    }
    else {
      const { type, url } = createNotFoundRoute(req, prev)
      action.type = type
      req = reduxAction(req, url, action, prev, history, basename)
    }
  }
  catch (e) {
    const { type, url } = createNotFoundRoute(req, prev)
    const payload = (action && action.payload) || {}
    const act = { ...action, type, payload }
    req = reduxAction(req, url, act, prev, history, basename)
  }

  if (isDoubleDispatch(req, state)) return req.action

  const { type, payload, query, hash, state: st } = req.action
  Object.assign(req, { type, payload, query, hash, state: st })

  await next()
  return req.action
}

