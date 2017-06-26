// @flow
import type { Action, Location, ReceivedAction, History } from '../flow-types'

export default (
  pathname: string,
  receivedAction: ReceivedAction,
  prev: Location,
  history: History, // not used currently, but be brought back
  kind: ?string
): Action => {
  const { type, payload = {}, meta } = receivedAction

  return {
    ...receivedAction, // keep any possible other non-FSA keys
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
