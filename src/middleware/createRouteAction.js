import pathToAction from '../pure-utils/pathToAction'
import actionToPath from '../pure-utils/actionToPath'
import isRedirect from '../pure-utils/isRedirect'
import { NOT_FOUND } from '../index'

const pick = (obj, keys) => keys.reduce((acc, k) => (acc[k] = obj[k], acc), {})

export default async (req, next) => {
  const {
    history,
    routesMap,
    options: { querySerializer: serializer },
    getLocationState,
    nextHistory,
    action
  } = req

  const state = getLocationState()
  const keys = ['pathname', 'type', 'payload', 'kind', 'index', 'length']
  const prev = pick(state, keys)

  const notFoundPath = routesMap[NOT_FOUND].path

  try {
    if (nextHistory) {
      const { url } = nextHistory.location
      const action = pathToAction(url, routesMap, serializer)

      req.action = nestAction(url, action, prev, nextHistory)
      req.route = routesMap[action.type]
    }
    else if (action && action.type !== NOT_FOUND) {
      const url = actionToPath(action, routesMap, serializer)
      const shouldRedirect = isRedirect(action) && action.committed
      const method = shouldRedirect ? 'redirect' : 'push'
      const { nextHistory, commit } = history[method](url, {}, false)

      nextHistory.kind = isRedirect(action) ? 'redirect' : 'push'
      const pre = isRedirect(action) ? action.prev.meta.location.current : prev

      req.action = nestAction(url, action, pre, nextHistory)
      req.nextHistory = nextHistory
      req.commit = commit
    }
    else if (action) {
      const method = isRedirect(action) ? 'redirect' : 'push'
      const url = (action.meta && action.meta.notFoundPath) || notFoundPath
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

  // need to take into consideration full URL!:
  if (req.action.meta.location.current.pathname === getLocationState().pathname && getLocationState().kind !== 'init') return req.action

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
          index: nextHistory.index,
          length: nextHistory.length,
          ...(query && { query, search })
        },
        kind,
        prev,
        history: nextHistory
      }
    }
  }
}
