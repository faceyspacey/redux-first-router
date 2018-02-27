import { isRedirect } from '../../../utils'
import { nestAction } from './index'

export default (req, url, action, history) => {
  const { state, basename: bn } = action
  const redirect = isRedirect(action)
  const redirectCommitted = redirect && req.tmp.committed
  let method = redirectCommitted ? 'replace' : 'push'                 // redirects before committing are just pushes (since the original route was never pushed)
  let pop

  // handle redirects from back/next actions, where we want to replace in place
  // instead of pushing a new entry to preserve proper movement along history track
  if (!req.tmp.committed && req.tmp.prevAction) {
    const { basename, location } = req.tmp.prevAction
    const { index, entries, pathname: prevUrl } = location
    let n = getPrevNextN(prevUrl, req.history)
    console.log('HELP', n, prevUrl, req.history.index, req.history.entries)
    if (n) {
      if (!isNAdjacentToSameUrl(url, req.history, n)) {
        n = req.tmp.revertPop ? null : n // if this back/next movement is do to a user-triggered pop (browser back/next buttons), we don't need to shift the browser history by n, since it's already been done
        pop = { n, entries, index, location: { basename, url: prevUrl } }
        console.log('SINGLE POP!', pop)
        method = 'replacePop'
      }
      else {
        const newIndex = index + n
        const newLocation = entries[newIndex]
        n = req.tmp.revertPop ? n : n * 2
        pop = { n, entries, index: newIndex, location: newLocation }
        console.log('DOUBLE POP!!!', pop)
        method = 'replacePop'
      }
    }
  }

  const { nextHistory, commit } = history[method](url, state, bn, false, pop)// get returned the same action as functions passed to `history.listen`

  if (redirect) {
    // the kind no matter what reflects the appropriate intent
    // but we must also consider automatic back/next detection by `history`
    nextHistory.kind = /back|next/.test(nextHistory.kind) ? nextHistory.kind : 'redirect'
  }

  const curr = req.getLocation()
  let from                                                              // `from` represents the route the user would have gone to had there been no redirect
  let prev = curr.kind === 'init' ? curr.prev : curr                    // `init` comes before initial `load` action, but they share the same `prev` state, as they are essentially the same, except the former is the initial state before any actions are dispatched

  if (redirect) {
    from = req.tmp.from || prev                                         // `prev` used when redirect comes from outside of pipeline via `redirect` action creator
    prev = redirectCommitted ? curr.prev : prev                         // `prev` maintains proper entries array, notwithstanding any redirects
  }

  req.action = nestAction(req, action, prev, nextHistory, from)
  req.commitHistory = commit                                            // put these here so `enter` middleware can commit the history, etc

  return req
}

const getPrevNextN = (url, history) => {
  const { entries, index } = history

  const prevLoc = entries[index - 1]
  if (prevLoc && prevLoc.url === url) return -1

  const nextLoc = entries[index + 1]
  if (nextLoc && nextLoc.url === url) return 1
}

const isNAdjacentToSameUrl = (url, history, n) => {
  const { entries, index } = history
  const loc = entries[index + (n * 2)]
  return loc && loc.url === url
}
