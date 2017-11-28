// @flow
import type { Action } from '../flow-types'

export default (basename: string, action: ?Action) => {
  if (!action) {
    return ({ location }) => ({
      ...location,
      location: { basename }
    })
  }

  action.location = { ...action.location, basename }
  return action
}
