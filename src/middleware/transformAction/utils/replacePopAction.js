// handle redirects from back/next actions, where we want to replace in place
// instead of pushing a new entry to preserve proper movement along history track

export default (n, url, history, tmp) => {
  const { entries, index } = tmp.prevAction.location

  if (!isNAdjacentToSameUrl(url, history, n)) {
    const { url: prevUrl } = tmp.prevAction.location
    n = tmp.revertPop ? null : n // if this back/next movement is due to a user-triggered pop (browser back/next buttons), we don't need to shift the browser history by n, since it's already been done
    return { n, entries, index, prevUrl }
  }

  const newIndex = index + n
  const { url: prevUrl } = entries[newIndex].location
  n = tmp.revertPop ? n : n * 2
  return { n, entries, index: newIndex, prevUrl }
}

const isNAdjacentToSameUrl = (url, history, n) => {
  const { entries, index } = history
  const loc = entries[index + (n * 2)]
  return loc && loc.location.url === url
}

export const findNeighboringN = (prevAction, history) => {
  if (!prevAction) return

  const prev = history.entries[history.index - 1]
  if (prev && prev.location.url === prevAction.location.url) return -1

  const next = history.entries[history.index + 1]
  if (next && next.location.url === prevAction.location.url) return 1
}
