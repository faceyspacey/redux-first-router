// handle redirects from back/next actions, where we want to replace in place
// instead of pushing a new entry to preserve proper movement along history track

export default (req, action, url, state, history, method, n) => {
  const { basename, location } = req.tmp.prevAction
  const { index, entries, url: prevUrl } = location

  if (!isNAdjacentToSameUrl(url, req.history, n)) {
    n = req.tmp.revertPop ? null : n // if this back/next movement is do to a user-triggered pop (browser back/next buttons), we don't need to shift the browser history by n, since it's already been done
    return { n, entries, index, location: { basename, url: prevUrl } }
  }

  const newIndex = index + n
  const newLocation = entries[newIndex]
  n = req.tmp.revertPop ? n : n * 2
  return { n, entries, index: newIndex, location: newLocation }
}

const isNAdjacentToSameUrl = (url, history, n) => {
  const { entries, index } = history
  const loc = entries[index + (n * 2)]
  return loc && loc.location.url === url
}
