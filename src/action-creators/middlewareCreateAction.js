// @flow
import type { RoutesMap, Location, Action, History } from '../flow-types'
import actionToPath from '../pure-utils/actionToPath'
import nestAction from '../pure-utils/nestAction'
import { NOT_FOUND } from '../index'

export default (
  action: Object,
  routesMap: RoutesMap,
  prevLocation: Location,
  hist: History
): Action => {
  try {
    const pathname = actionToPath(action, routesMap)
    const [kind, history] = getKindAndHistory(!!hist.entries, pathname, hist)
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
      hist
    )
  }
}

// REACT NATIVE FEATURE:
// emulate npm `history` package and `historyCreateAction`  so that actions
// and state indicate the user went back or forward. The idea is if you are
// going back or forward to a route you were just at, apps can determine
// from `state.location.backNext` and `action.backNext` that things like
// scroll position should be restored.
// NOTE: for testability, history is also returned to make this a pure function
const getKindAndHistory = (
  isMemoryHistory: boolean,
  pathname: string,
  history: History
): [?string, History] => {
  if (!isMemoryHistory) {
    return [undefined, history]
  }

  if (goingBack(pathname, history)) {
    history.index--
    return ['backNext', history]
  }
  else if (goingForward(pathname, history)) {
    history.index++
    return ['backNext', history]
  }

  return [undefined, history]
}

const goingBack = (pathname: string, history: History): boolean => {
  const prev = history.entries[history.index - 1]
  return prev && prev.pathname === pathname
}

const goingForward = (pathname: string, history: History): boolean => {
  const next = history.entries[history.index + 1]
  return next && next.pathname === pathname
}
