// @flow
import type { Action, Location, ReceivedAction } from '../flow-types'


export default (
  pathname: string,
  receivedAction: ReceivedAction,
  prev: Location,
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
      },
    },
  }
}
