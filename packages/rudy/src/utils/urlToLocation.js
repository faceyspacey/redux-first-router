// @flow
import type { HistoryLocation } from '../flow-types'

const createLocationObject = (url: string): HistoryLocation => {
  let pathname = url || '/'
  let search = ''
  let hash = ''

  const hashIndex = pathname.indexOf('#')
  if (hashIndex !== -1) {
    hash = pathname.substr(hashIndex + 1) // remove # from hash
    pathname = pathname.substr(0, hashIndex) // remove hash value from pathname
  }

  const searchIndex = pathname.indexOf('?')
  if (searchIndex !== -1) {
    search = pathname.substr(searchIndex + 1) // remove ? from search
    pathname = pathname.substr(0, searchIndex) // remove search value from pathname
  }

  pathname = pathname || '/' // could be empty on URLs that like: '?foo=bar#hash

  return { pathname, search, hash }
}

export default (url: HistoryLocation | string): HistoryLocation => {
  if (typeof url === 'object' && url.pathname !== undefined) return url
  return createLocationObject(url)
}
