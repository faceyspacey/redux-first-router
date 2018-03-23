export const urlToLocation = (url) => {
  if (typeof url === 'object') return url // already a location object

  let pathname = url || '/'
  let search = ''
  let hash = ''

  const hashIndex = pathname.indexOf('#')
  if (hashIndex !== -1) {
    hash = pathname.substr(hashIndex + 1)       // remove # from hash
    pathname = pathname.substr(0, hashIndex)    // remove hash value from pathname
  }

  const searchIndex = pathname.indexOf('?')
  if (searchIndex !== -1) {
    search = pathname.substr(searchIndex + 1)   // remove ? from search
    pathname = pathname.substr(0, searchIndex)  // remove search value from pathname
  }

  return { pathname, search, hash }
}

export const locationToUrl = location => {
  if (typeof location === 'string') return location // already a url

  const { pathname, search, hash } = location

  let path = pathname || '/'

  if (search && search !== '?') {
    path += search.charAt(0) === '?' ? search : `?${search}`
  }

  if (hash && hash !== '#') {
    path += hash.charAt(0) === '#' ? hash : `#${hash}`
  }

  return path
}


export const stripBasename = (path, bn) =>
  new RegExp(`^${bn}(\\/|\\?|#|$)`, 'i').test(path) ? path.substr(bn.length) : path

export const findBasename = (path, bns = []) =>
  bns.find(bn => path.indexOf(bn) === 0)


export const formatSlashes = path =>
  path === '' ? path : stripTrailingSlash(addLeadingSlash(path))

const addLeadingSlash = path =>
  path.charAt(0) === '/' ? path : `/${path}`

const stripTrailingSlash = path =>
  path.charAt(path.length - 1) === '/' ? path.slice(0, -1) : path
