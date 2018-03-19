import { isRedirect, actionToUrl } from '../../../utils'
import { nestAction, redirectAction } from './index'

export default (req) => {
  const { action, routes, options, history, prevRoute, getLocation } = req
  const { url, state } = actionToUrl(action, routes, options, prevRoute)

  const redirect = isRedirect(action)
  const redirectCommitted = redirect && (req.tmp.committed || !req.tmp.from) // committed after `enter` or also considered committed if a redirect triggered from outside the pipeline

  let mainAct = action
  let method = redirectCommitted ? 'replace' : 'push'                 // redirects before committing are just pushes (since the original route was never pushed)
  let pop
  let n

  if (!req.tmp.committed && (n = getPrevNextN(req.tmp.prevAction, req.history))) {
    method = 'replacePop'
    pop = redirectAction(req, action, url, state, history, method, n)
  }

  if (!action.commit) {
    const bn = getLocation().basename
    const { commit, ...act } = history[method](url, state, bn, false, pop)// get returned the same action as functions passed to `history.listen`
    mainAct = act
    req.commitHistory = commit                                            // put these here so `enter` middleware can commit the history, etc
  }

  const curr = req.getLocation()
  const prev = req.tmp.load || redirectCommitted ? curr.prev : curr     // `init` comes before initial `load` action, but they share the same `prev` state, as they are essentially the same, except the former is the initial state before any actions are dispatched; -- about `prev` vs `from`: `prev` maintains proper entries array, notwithstanding any redirects, whereas `from` honors where the user tried to go, but never became the location state
  const from = redirect ? req.tmp.from || curr : undefined              // `from` represents the route the user would have gone to had there been no redirect; `curr` used when redirect comes from outside of pipeline via `redirect` action creator

  const status = action.location && action.location.status

  req.action = nestAction(req, mainAct, prev, from, status)
  return req
}

const getPrevNextN = (prevAction, history) => {
  if (!prevAction) return

  const prev = history.entries[history.index - 1]
  if (prev && prev.location.url === prevAction.location.url) return -1

  const next = history.entries[history.index + 1]
  if (next && next.location.url === prevAction.location.url) return 1
}

