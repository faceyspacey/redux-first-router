import pathToAction from '../utils/pathToAction'
import actionToPath from '../utils/actionToPath'
import isRedirect, { isCommittedRedirect } from '../utils/isRedirect'
import { NOT_FOUND } from '../index'

export default async (req, next) => {
  const {
    history,
    routesMap,
    options: { basename: bn, querySerializer: serializer },
    getLocationState,
    nextHistory,
    action
  } = req

  const state = getLocationState()
  const basename = state.basename || bn
  const k = ['pathname', 'type', 'payload', 'kind', 'index', 'length', 'query']
  const prev = pick(state.kind === 'init' ? state.prev : state, k)
  const notFoundPath = routesMap[NOT_FOUND].path

  try {
    if (nextHistory) {
      const { url } = nextHistory.location
      const action = pathToAction(url, routesMap, basename, serializer)
      req.route = routesMap[action.type]
      req.action = nestAction(url, action, prev, nextHistory, basename)
    }
    else if (action && action.type !== NOT_FOUND) {
      const url = actionToPath(action, routesMap, serializer)
      req = prepRequest(url, action, prev, history, basename, req)
    }
    else if (action) {
      const url = (action.meta && action.meta.notFoundPath) || notFoundPath
      req = prepRequest(url, action, prev, history, basename, req)
    }
    else throw new Error('no action or nextHistory')
  }
  catch (e) {
    const url = notFoundPath || prev.pathname || '/'
    const act = { ...action, type: NOT_FOUND, payload: { ...action.payload } }
    req = prepRequest(url, act, prev, history, basename, req)
  }

  if (isDoubleDispatch(req, state)) return req.action

  await next()
  return req.action
}


const pick = (obj, keys) => keys.reduce((acc, k) => {
  if (obj[k] !== undefined) acc[k] = obj[k]
  return acc
}, {})


const isDoubleDispatch = (req, state) =>
  req.action.meta.location.current.pathname === state.pathname &&
  req.action.meta.location.current.search === state.search &&
  req.action.meta.location.basename === state.basename &&
  state.kind !== 'init'


const prepRequest = (url, action, prev, history, bn, req) => {
  const basename = (action.meta && action.meta.basename) || bn          // allow basenames to be changed along with any route change
  const method = isCommittedRedirect(action, req) ? 'redirect' : 'push' // redirects before committing are just pushes (since the original route was never pushed)
  const { nextHistory, commit } = history[method](url, {}, false)       // get returned the same "bag" as functions passed to `history.listen`
  const redirect = isRedirect(action)

  // if multiple redirects in one pass, the latest LAST redirect becomes prev
  const tp = req.temp.prev
  prev = redirect && tp ? tp.meta.location.current : prev

  nextHistory.kind = redirect ? 'redirect' : nextHistory.kind           // the kind no matter what relfects the appropriate intent

  req.action = nestAction(url, action, prev, nextHistory, basename)
  req.nextHistory = nextHistory                                         // put these here so `enter` middleware can commit the history, etc
  req.commitHistory = commit

  return req
}


export const nestAction = (url, action, prev, nextHistory, basename) => {
  const { kind, entries, index, length } = nextHistory
  const { type, payload = {}, meta = {} } = action
  const parts = url.split('?')
  const search = parts[1]

  return {
    kind,
    ...action,
    type,
    payload,
    meta: {
      ...meta,
      location: {
        current: {
          pathname: parts[0],
          type,
          payload,
          kind,
          index: nextHistory.index,
          length: nextHistory.length,
          ...(search && { search })
        },
        kind,
        prev,
        history: { kind, entries, index, length },
        basename
      }
    }
  }
}
