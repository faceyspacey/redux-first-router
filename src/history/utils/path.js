import { createLocation, createKey } from './index'

const addLeadingSlash = path =>
  path.charAt(0) === '/' ? path : `/${path}`

const stripTrailingSlash = path =>
  path.charAt(path.length - 1) === '/' ? path.slice(0, -1) : path

export const formatSlashes = path => stripTrailingSlash(addLeadingSlash(path))

export const parsePath = (path) => {
  let pathname = path || '/'
  let search = ''
  let hash = ''

  const hashIndex = pathname.indexOf('#')
  if (hashIndex !== -1) {
    hash = pathname.substr(hashIndex + 1)
    pathname = pathname.substr(0, hashIndex)
  }

  const searchIndex = pathname.indexOf('?')
  if (searchIndex !== -1) {
    search = pathname.substr(searchIndex + 1)
    pathname = pathname.substr(0, searchIndex)
  }

  return { pathname, search, hash }
}

export const createPath = location => {
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

export const transformEntry = (e, bns) => {
  const { entry, basename } = stripPath(e, bns)
  const state = entry.state || {}
  const key = e ? e.key : createKey()
  return createLocation(entry, state, key, null, basename)
}

const stripPath = (path, basenames) => {
  if (typeof path === 'string') {
    const basename = findBasename(path, basenames)
    const entry = basename ? stripBasename(path, basename) : path
    return { entry, basename }
  }

  const entry = path
  return { entry, basename: entry.basename }
}

export const hasBasename = (path, prefix) =>
  new RegExp(`^${prefix}(\\/|\\?|#|$)`, 'i').test(path)

export const stripBasename = (path, bn) =>
  hasBasename(path, bn) ? path.substr(bn.length) : path

export const findBasename = (path, bns = []) => {
  return bns.find(bn => path.indexOf(bn) === 0)
}
