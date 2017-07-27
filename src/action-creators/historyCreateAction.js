// @flow
import type {
  RoutesMap,
  Location,
  Action,
  History,
  QuerySerializer
} from '../flow-types'
import pathToAction from '../pure-utils/pathToAction'
import nestAction from '../pure-utils/nestAction'

export default (
  pathname: string,
  routesMap: RoutesMap,
  prevLocation: Location,
  history: History,
  kind: string,
  serializer?: QuerySerializer,
  prevPath?: string,
  prevLength?: number
): Action => {
  const action = pathToAction(pathname, routesMap, serializer)
  kind = getKind(!!history.entries, history, kind, prevPath, prevLength)
  return nestAction(pathname, action, prevLocation, history, kind)
}

const getKind = (
  isMemoryHistory: boolean,
  history: History,
  kind: string,
  prevPath: ?string,
  prevLength: ?number
): string => {
  if (!isMemoryHistory || !prevPath || kind !== 'pop') {
    return kind
  }

  if (isBack(history, prevPath)) {
    return 'back'
  }
  else if (isNext(history, prevPath, prevLength)) {
    return 'next'
  }

  return kind
}

const isBack = (hist: History, path: string): boolean => {
  const next = hist.entries[hist.index + 1]
  return next && next.pathname === path
}

const isNext = (hist: History, path: string, length: ?number): boolean => {
  const prev = hist.entries[hist.index - 1]
  const notPushed = length === hist.length

  return prev && prev.pathname === path && notPushed
}
