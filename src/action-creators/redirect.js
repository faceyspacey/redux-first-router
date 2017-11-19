// @flow
import type { Action } from '../flow-types'

export default (action: Action, status: number = 302) => ({
  ...action,
  location: {
    status,
    ...action.location,
    url: null, // insures action can go through pipeline (`url` indicates its passed through already), see `utils/isLocationAction.js`
    kind: 'redirect',
    committed: true // used to determine whether to do `history.redirect` or `history.push` (see utils/createDispatch.js)
  }
})
