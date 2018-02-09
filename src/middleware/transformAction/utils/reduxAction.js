import { isRedirect, isCommittedRedirect } from '../../../utils'
import { nestAction } from './index'

export default (req, url, action, history) => {
  const { state, basename: bn } = action
  const redirect = isRedirect(action)
  const redirectCommitted = redirect && req.tmp.committed
  const method = redirectCommitted ? 'replace' : 'push'                 // redirects before committing are just pushes (since the original route was never pushed)
  const { nextHistory, commit } = history[method](url, state, bn, false)// get returned the same action as functions passed to `history.listen`

  nextHistory.kind = redirect ? 'redirect' : nextHistory.kind           // the kind no matter what relfects the appropriate intent

  const curr = req.getLocation()
  let from                                                              // `from` represents the route the user would have gone to had there been no redirect
  let prev = curr.kind === 'init' ? curr.prev : curr                    // `init` comes before initial `load` action, but they share the same `prev` state, as they are essentially the same, except the former is the initial state before any actions are dispatched

  if (redirect) {
    from = req.tmp.from || prev                                         // `prev` used when redirect comes from outside of pipeline via `redirect` action creator
    prev = redirectCommitted ? curr.prev : prev                         // `prev` maintains proper entries array, notwithstanding any redirects
  }

  req.action = nestAction(action, prev, nextHistory, from)
  req.commitHistory = commit                                            // put these here so `enter` middleware can commit the history, etc

  return req
}
