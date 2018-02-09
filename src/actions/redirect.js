// @flow
import type { Action } from '../flow-types'

export default (action: Action, status: number = 302) => ({
  ...action,
  location: {
    ...action.location,
    status,
    url: null, // insures action can go through pipeline (`url` indicates its passed through already), see `utils/isTransformed.js`
    kind: 'redirect'
  }
})
