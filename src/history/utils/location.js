import resolvePathname from 'resolve-pathname'
import { parsePath, createPath, stripBasename, formatSlashes } from './index'

export const createLocation = (path, state, key, currentLocation, basename) => {
  let location

  if (typeof path === 'string') {
    location = parsePath(path)
    location.state = state
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
  location.url = createPath(location)
  location.basename = location.basename || basename || ''

  if (location.basename) {
    location.basename = formatSlashes(location.basename)
  }

  return location
}

export const getWindowLocation = (historyState, basenames = []) => {
  const { key, state } = historyState || {}
  const { pathname, search, hash } = window.location
  let path = pathname + search + hash

  const basename = basenames.find(bn => path.indexOf(bn) === 0)

  if (basename) path = stripBasename(path, basename)
  return createLocation(path, state, key, null, basename)
}

export const createKey = () =>
  Math.random().toString(36).substr(2, 6)
