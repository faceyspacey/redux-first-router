// @flow
import type { Action } from '../flow-types'

export default (action: Action, status: number = 302) => ({
  ...action,
  location: {
    ...action.location,
    status,
    kind: 'redirect'
  }
})
