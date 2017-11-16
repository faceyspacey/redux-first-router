// @flow
import type { Action } from '../flow-types'

export default (action: Action, status: number = 302) => ({
  ...action,
  kind: 'redirect',
  meta: {
    ...action.meta,
    location: {
      status,
      ...(action.meta && action.meta.location),
      current: null, // insures action can go through pipeline (`current` indicates its passed through already), see `utils/isLocationAction.js`
      kind: 'redirect',
      committed: true // used to determine whether to do `history.redirect` or `history.push` (see utils/isRedirect.js)
    }
  }
})
