import pathToAction from '../pure-utils/pathToAction'
import actionToPath from '../pure-utils/actionToPath'
import { NOT_FOUND } from '../index'

export default (req, next) => {
  const {
    history,
    routesMap,
    options: { querySerializer: serializer, notFoundPath },
    getLocationState,
    nextHistory,
    action
  } = req

  const { hasSSR, entries, routesMap: r, ...prev } = getLocationState()

  try {
    if (nextHistory) {
      const { url } = nextHistory.location
      const action = pathToAction(url, routesMap, serializer)
      req.action = nestAction(url, action, prev, nextHistory)
    }
    else if (action && action.type !== NOT_FOUND) {
      const url = actionToPath(action, routesMap, serializer)
      const nextHistory = history.create(url)
      req.action = nestAction(url, action, prev, nextHistory)
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

  return next()
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
        prev,
        kind,
        entries: nextHistory.entries.slice(0)
      }
    }
  }
}
