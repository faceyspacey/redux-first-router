import pathToAction from '../pure-utils/pathToAction'
import actionToPath from '../pure-utils/actionToPath'
import isRedirect from '../pure-utils/isRedirect'
import { NOT_FOUND } from '../index'

export default async (req, next) => {
  const {
    history,
    routesMap,
    options: { querySerializer: serializer, notFoundPath },
    getLocationState,
    nextHistory,
    action
  } = req

  const state = getLocationState()
  const { hasSSR, routesMap: r, prev: p, entries: e, ...prev } = state

  try {
    if (nextHistory) {
      const { url } = nextHistory.location
      const action = pathToAction(url, routesMap, serializer)

      req.action = nestAction(url, action, prev, nextHistory)
      req.route = routesMap[action.type]
    }
    else if (action && action.type !== NOT_FOUND) {
      const url = actionToPath(action, routesMap, serializer)
      const method = isRedirect(action) ? 'redirect' : 'push'
      const { nextHistory, commit } = history[method](url, {}, false)

      req.action = nestAction(url, action, prev, nextHistory)
      req.nextHistory = nextHistory
      req.commit = commit
    }
  }
  catch (e) {
    req.action = nestAction(
      notFoundPath || prev.pathname || '/',
      { ...action, type: NOT_FOUND, payload: { ...action.payload } },
      prev,
      nextHistory
    )
  }

  await next()
  return req.action
}

const nestAction = (pathname, action, prev, nextHistory) => {
  const { kind } = nextHistory
  const { type, payload = {}, meta = {} } = action
  const query = action.query || meta.query || payload.query
  const parts = pathname.split('?')
  const search = parts[1]

  return {
    kind,
    ...action,
    ...(action.query && { query }),
    type,
    payload,
    meta: {
      ...meta,
      ...(meta.query && { query }),
      location: {
        current: {
          pathname: parts[0],
          type,
          payload,
          kind,
          ...(query && { query, search })
        },
        kind,
        prev,
        history: nextHistory
      }
    }
  }
}
