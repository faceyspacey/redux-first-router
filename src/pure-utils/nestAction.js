// @flow
import type { Action, Location, ReceivedAction, History } from '../flow-types'

export default (
  pathname: string,
  action: ReceivedAction,
  prev: Location,
  history: History, // not used currently, but be brought back
  kind: ?string
): Action => {
  const { type, payload = {}, meta = {} } = action
  const query = action.query || meta.query || payload.query
  const parts = pathname.split('?')
  const search = parts[1]

  return {
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
          ...(query && { query, search })
        },
        prev,
        kind,
        history: undefined
      }
    }
  }
}

export const nestHistory = (history: History) =>
  (history.entries
    ? {
      index: history.index,
      length: history.entries.length,
      entries: history.entries.slice(0) // history.entries.map(entry => entry.pathname)
    }
    : undefined)
