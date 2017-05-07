// @flow
import type {
  Action,
  Location,
  ReceivedAction,
  History,
  HistoryData
} from '../flow-types'

export default (
  pathname: string,
  receivedAction: ReceivedAction,
  prev: Location,
  history: History,
  kind?: ?string
): Action => {
  const { type, payload = {}, meta } = receivedAction

  return {
    type,
    payload,
    meta: {
      ...meta,
      location: {
        current: {
          pathname,
          type,
          payload
        },
        prev,
        load: kind === 'load' ? true : undefined,
        backNext: kind === 'backNext' ? true : undefined,
        redirect: meta && meta.location && meta.location.redirect
          ? pathname
          : undefined,
        history: getHistory(!!history.entries, pathname, history, !kind)
      }
    }
  }
}

const getHistory = (
  isMemoryHistory: boolean,
  pathname: string,
  history: History,
  isMiddleware: boolean
): ?HistoryData => {
  if (!isMemoryHistory) {
    return undefined
  }

  const shouldPushEntry =
    isMiddleware && history.entries[history.index].pathname !== pathname

  // insure if the user went back in the history that we erase previous future entries
  const entries = shouldPushEntry
    ? history.entries.slice(0, history.index + 1).map(entry => entry.pathname)
    : history.entries.map(entry => entry.pathname)

  return {
    entries: shouldPushEntry ? [...entries, pathname] : entries,
    index: shouldPushEntry ? history.index + 1 : history.index,
    length: shouldPushEntry ? history.index + 2 : history.length
  }
}
