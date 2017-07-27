// @flow
import type {
  RoutesMap,
  Location,
  Action,
  ReceivedAction,
  History,
  QuerySerializer
} from '../flow-types'
import actionToPath from '../pure-utils/actionToPath'
import nestAction from '../pure-utils/nestAction'
import { NOT_FOUND } from '../index'

export default (
  action: Object,
  routesMap: RoutesMap,
  prevLocation: Location,
  history: History,
  notFoundPath: string,
  serializer?: QuerySerializer
): Action => {
  try {
    const pathname = actionToPath(action, routesMap, serializer)
    const kind = getKind(!!history.entries, pathname, history, action)
    return nestAction(pathname, action, prevLocation, history, kind)
  }
  catch (e) {
    const payload = { ...action.payload }

    return nestAction(
      notFoundPath || prevLocation.pathname || '/',
      { ...action, type: NOT_FOUND, payload },
      prevLocation,
      history
    )
  }
}

// REACT NATIVE FEATURE:
// emulate npm `history` package and `historyCreateAction`  so that actions
// and state indicate the user went back or forward. The idea is if you are
// going back or forward to a route you were just at, apps can determine
// from `state.location.kind === 'back|next'` and `action.kind` that things like
// scroll position should be restored.
// NOTE: for testability, history is also returned to make this a pure function
const getKind = (
  isMemoryHistory: boolean,
  pathname: string,
  history: History,
  action: ReceivedAction
): ?string => {
  const kind = action.meta && action.meta.location && action.meta.location.kind

  if (kind) {
    return kind
  }
  else if (!isMemoryHistory) {
    return 'push'
  }

  if (goingBack(history, pathname)) {
    history.index--
    return 'back'
  }
  else if (goingForward(history, pathname)) {
    history.index++
    return 'next'
  }

  return 'push'
}

const goingBack = (hist: History, path: string): boolean => {
  const prev = hist.entries[hist.index - 1]
  return prev && prev.pathname === path
}

const goingForward = (hist: History, path: string): boolean => {
  const next = hist.entries[hist.index + 1]
  return next && next.pathname === path
}
