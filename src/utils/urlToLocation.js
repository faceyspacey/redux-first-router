export default (url) => {
  if (typeof url === 'object' && url.pathname) return url

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
