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
    options,
    action,
    history,
    getLocation
  } = req

  if (action.type !== UPDATE_HISTORY && !route.path) return next() // only create route actions if from history or routes with paths

  const state = getLocation()
  const prev = state.kind === 'init' ? state.prev : state

  try {
    if (action.type === UPDATE_HISTORY) {
      const { location } = action.nextHistory
      const act = urlToAction(location, routes, options)
      req = historyAction(req, act, prev)
    }
    else if (!isNotFound(action)) {
      const url = actionToUrl(action, routes, options)
      req = reduxAction(req, url, action, prev, history)
    }
    else {
      const { type, url } = createNotFoundRoute(req, prev)
      action.type = type
      req = reduxAction(req, url, action, prev, history)
    }
  }
  catch (e) {
    const { type, url } = createNotFoundRoute(req, prev)
    const params = (action && action.params) || {}
    const act = { ...action, type, params }
    req = reduxAction(req, url, act, prev, history)
  }

  if (isDoubleDispatch(req, state)) return req.action

  const { type, params, query, hash, state: st } = req.action
  Object.assign(req, { type, params, query, hash, state: st })

  await next()
  return req.action
}

