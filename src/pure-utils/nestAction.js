// @flow
import type { Action, Location, ReceivedAction, History } from '../flow-types'


export default (
  pathname: string,
  receivedAction: ReceivedAction,
  prev: Location,
  history: History,
  isMiddleware: boolean,
  kind?: string,
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
          payload,
        },
        prev,
        load: kind === 'load' ? true : undefined,
        backNext: kind === 'backNext' ? true : undefined,
        redirect: meta && meta.location && meta.location.redirect ? pathname : undefined,
        history: getHistory(pathname, history, isMiddleware),
      },
    },
  }
}


const getHistory = (pathname, history, isMiddleware) => {
  if (!history.entries) {
    return undefined
  }

  const shouldPushEntry = isMiddleware && history.entries[history.index].pathname !== pathname

  // insure if the user went back in the history that we erase previous future entries
  const entries = shouldPushEntry
    ? history.entries.slice(0, history.index + 1).map(entry => entry.pathname)
    : history.entries.map(entry => entry.pathname)

  return {
    entries: shouldPushEntry ? [...entries, pathname] : entries,
    index: shouldPushEntry ? history.index + 1: history.index,
    length: shouldPushEntry ? history.index + 2 : history.length,
  }
}
