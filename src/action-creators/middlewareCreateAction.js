// @flow
import type { RoutesMap, Location, Action, History } from '../flow-types'
import actionToPath from '../pure-utils/actionToPath'
import nestAction from '../pure-utils/nestAction'
import { NOT_FOUND } from '../index'

export default (
  action: Object,
  routesMap: RoutesMap,
  prevLocation: Location,
  history: History
): Action => {
  try {
    const pathname = actionToPath(action, routesMap)
    const kind = getKind(pathname, history)
    return nestAction(pathname, action, prevLocation, history, kind)
  }
  catch (e) {
    // developer dispatched an invalid type + payload
    // preserve previous pathname to keep app stable for future correct actions that depend on it
    const pathname = prevLocation.pathname
    const payload = { ...action.payload }

    return nestAction(
      pathname,
      { type: NOT_FOUND, payload },
      prevLocation,
      history
    )
  }
}

const getKind = (pathname: string, history: History): ?string => {
  const isMemoryHistory = !!history.entries

  if (!isMemoryHistory) {
    return undefined
  }

  const isLast = history.index === history.length - 1
  const prev = history.entries[history.index - 1]
  // REACT NATIVE FEATURE:
  // emulate npm `history` package and `historyCreateAction`  so that actions
  // and state indicate the user went back or forward. The idea is if you are
  // going back or forward to a route you were just at, apps can determine
  // from `state.location.backNext` and `action.backNext` that things like
  // scroll position should be restored.
  if (isLast && prev) {
    const prevPath = prev.pathname
    const isGoingBack = prevPath === pathname

    if (isGoingBack) {
      history.index--
      return 'backNext'
    }

    return undefined
  }

  const next = history.entries[history.index + 1]

  if (next) {
    const nextPath = next.pathname
    const isGoingForward = nextPath === pathname

    if (isGoingForward) {
      history.index++
      return 'backNext'
    }
  }

  return undefined
}
