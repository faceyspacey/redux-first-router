import { isRedirect, isCommittedRedirect } from '../../../utils'
import { nestAction } from './index'

export default (req, url, action, prev, history) => {
  if (action.basename) history.setBasename(action.basename)             // allow basenames to be changed along with any route change

  const { state } = action
  const method = isCommittedRedirect(action, req) ? 'replace' : 'push'  // redirects before committing are just pushes (since the original route was never pushed)
  const { nextHistory, commit } = history[method](url, state, false)    // get returned the same action as functions passed to `history.listen`
  const redirect = isRedirect(action)

  prev = (redirect && req.tmp.prev) || prev                             // if multiple redirects in one pass, the latest LAST redirect becomes prev; otherwise, just use prev state

  nextHistory.kind = redirect ? 'redirect' : nextHistory.kind           // the kind no matter what relfects the appropriate intent

  req.action = nestAction(action, prev, nextHistory)
  req.commitHistory = commit                                            // put these here so `enter` middleware can commit the history, etc

  return req
}