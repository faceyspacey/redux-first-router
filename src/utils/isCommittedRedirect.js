// @flow
import type { Action } from '../flow-types'
import { isRedirect } from './index'

export default (action: Action, req) =>
  !!(isRedirect(action) && (req.tmp.committed || action.location.committed))

// HISTORY ENTRIES PUSH/REPLACE LOGIC:
//
// `isCommittedRedirect` if `true` triggers the `transformAction` middleware to
// do `history.replace` (resulting in a replace on the entries array) instead of `history.push`.
//
// This will happen in 2 cases:
// A) user dispatched a route action in the middleware pipeline after `enter` (`req.tmp.committed`)
// B) user dispatched a redirect manually using the `redirect` action creator prior to pipeline (`action.location.committed`)
//
// Its primary purpose is case A) where the route will have already changed, and we need to replace it.
// For the latter case see actionCreators/redirect.js for how `.committed` is set to `true` by default.
//
// FINAL NOTE: see `core/createDispatch.js` for complete info.
