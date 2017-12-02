// @flow
import type { Action } from '../flow-types'

export default (basename: string, action: ?Action) => {
  if (!action) {
    return ({ initialLocation }) => {
      const { type, params, query, state, hash } = initialLocation
      return { type, params, query, state, hash, location: { basename } }
    }
  }

  action.location = { ...action.location, basename }
  return action
}
