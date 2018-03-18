import { nestAction } from './index'

// handle redirects from back/next actions, where we want to replace in place
// instead of pushing a new entry to preserve proper movement along history track

export default (req, action, url, state, history) => {
  const { basename, location } = req.tmp.prevAction
  const { index, entries, pathname: prevUrl } = location

  let method = 'push'
  let n = getPrevNextN(prevUrl, req.history)
  let pop

  if (n) {
    if (!isNAdjacentToSameUrl(url, req.history, n)) {
      method = 'replacePop'
      n = req.tmp.revertPop ? null : n // if this back/next movement is do to a user-triggered pop (browser back/next buttons), we don't need to shift the browser history by n, since it's already been done
      pop = { n, entries, index, location: { basename, url: prevUrl } }
    }
    else {
      const newIndex = index + n
      const newLocation = entries[newIndex]
      method = 'replacePop'
      n = req.tmp.revertPop ? n : n * 2
      pop = { n, entries, index: newIndex, location: newLocation }
    }
  }

  const { nextHistory, commit } = history[method](url, state, action.basename, false, pop)// get returned the same action as functions passed to `history.listen`

  const curr = req.getLocation()
  const prev = req.tmp.load ? curr.prev : curr                            // `init` comes before initial `load` action, but they share the same `prev` state, as they are essentially the same, except the former is the initial state before any actions are dispatched
  const from = req.tmp.from || prev                                       // `from` represents the route the user would have gone to had there been no redirect

  req.action = nestAction(req, action, prev, nextHistory, from)
  req.commitHistory = commit                                            // put these here so `enter` middleware can commit the history, etc

  return req
}

const getPrevNextN = (url, history) => {
  const { entries, index } = history

  const prevLoc = entries[index - 1]
  if (prevLoc && prevLoc.location.url === url) return -1

  const nextLoc = entries[index + 1]
  if (nextLoc && nextLoc.location.url === url) return 1
}

const isNAdjacentToSameUrl = (url, history, n) => {
  const { entries, index } = history
  const loc = entries[index + (n * 2)]
  return loc && loc.location.url === url
}
