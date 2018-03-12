import resolvePathname from 'resolve-pathname'
import { parsePath, createPath, stripBasename, findBasename, formatSlashes } from './index'
import { urlToAction } from '../../utils'

export const createLocation = (path, state, key, currentLocation, basename) => {
  let location

  if (typeof path === 'string') {
    location = parsePath(path)
    location.state = state || {}
  }
  else {
    location = { ...path }
    const { pathname, search, hash } = location

    if (pathname === undefined) location.pathname = ''

    location.search = !search ? '' : search
    location.hash = !hash ? '' : hash
    location.state = { ...location.state, ...state }
  }

  const { pathname } = location

  if (currentLocation) {
    // Resolve incomplete/relative pathname relative to current location.
    if (!pathname) {
      location.pathname = currentLocation.pathname
    }
    else if (pathname.charAt(0) !== '/') {
      location.pathname = resolvePathname(pathname, currentLocation.pathname)
    }
  }
  else if (!pathname) {
    // When there is no prior location and pathname is empty, set it to /
    location.pathname = '/'
  }

  location.key = location.key || key || createKey()
  location.basename = location.basename || basename || ''

  if (location.basename) {
    location.basename = formatSlashes(location.basename)
  }

  location.url = location.basename + createPath(location)

  return location
}

export const createAction = (entry, routes, opts, state, key, basename, currLoc) => {
  if (typeof entry === 'string') {
    const foundBasename = findBasename(entry, opts.basenames)
    entry = foundBasename ? stripBasename(entry, foundBasename) : entry
    basename = foundBasename || basename
  }

  const location = createLocation(entry, state, key, currLoc, basename)

  return location
  const action = urlToAction(location, routes, opts)
  return {
    ...location,
    ...action,
    location
  }
}

export const getWindowLocation = (historyState, routes, opts) => {
  const { key, state } = historyState || {}
  const { pathname, search, hash } = window.location
  const url = pathname + search + hash

  return createAction(url, routes, opts, state, key)
}

export const createKey = () =>
  Math.random().toString(36).substr(2, 6)
