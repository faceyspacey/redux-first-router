// @flow

import type { Action, Location } from '../flow-types'


export default function nestAction(
  pathname: string,
  receivedAction: Action,
  prev: Location,
): Action {
  const { type, payload, meta } = receivedAction

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
      },
    },
  }
}
