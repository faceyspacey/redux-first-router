// handle redirects from back/next actions, where we want to replace in place
// instead of pushing a new entry to preserve proper movement along history track

export default (n, url, curr, tmp) => {
  const { entries, index } = tmp.from.location

  if (!isNAdjacentToSameUrl(url, curr, n)) {
    const { url: prevUrl } = tmp.from.location
    n = tmp.revertPop ? null : n // if this back/next movement is due to a user-triggered pop (browser back/next buttons), we don't need to shift the browser history by n, since it's already been done
    return { n, entries, index, prevUrl }
  }

  const newIndex = index + n
  const { url: prevUrl } = entries[newIndex].location
  n = tmp.revertPop ? n : n * 2
  return { n, entries, index: newIndex, prevUrl }
}

const isNAdjacentToSameUrl = (url, curr, n) => {
  const { entries, index } = curr
  const loc = entries[index + n * 2]
  return loc && loc.location.url === url
}

export const findNeighboringN = (from, curr) => {
  const { entries, index } = curr

  const prev = entries[index - 1]
  if (prev && prev.location.url === from.location.url) return -1

  const next = entries[index + 1]
  if (next && next.location.url === from.location.url) return 1
}
