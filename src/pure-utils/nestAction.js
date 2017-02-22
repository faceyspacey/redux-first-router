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
  const shouldPushEntry = isMiddleware && history.entries[history.index].pathname !== pathname

  const entries = shouldPushEntry
    ? history.entries.slice(0, history.index + 1).map(entry => entry.pathname)
    : history.entries.map(entry => entry.pathname)

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
        history: {
          entries: shouldPushEntry ? [...entries, pathname] : entries,
          index: shouldPushEntry ? history.index + 1: history.index,
          length: shouldPushEntry ? history.index + 2 : history.length,
        },
      },
    },
  }
}
