import resolvePathname from 'resolve-pathname'
import { parsePath, createPath, stripBasename, hasBasename } from './path'

export const createLocation = (path, state, key, currentLocation) => {
  let location

  if (typeof path === 'string') {
    location = parsePath(path)
    location.state = state
  }
  else {
    location = { ...path }
    const { pathname, search, hash } = location

    if (pathname === undefined) location.pathname = ''

    location.search = !search
      ? ''
      : search.charAt(0) !== '?' ? `?${search}` : search

    location.hash = !hash ? '' : hash.charAt(0) !== '#' ? `#${hash}` : hash

    location.state = { ...location.state, ...state }
  }

  try {
    location.pathname = decodeURI(location.pathname)
  }
  catch (e) {
    if (e instanceof URIError) {
      throw new URIError(
        `Pathname "${
          location.pathname
          }" could not be decoded. ` +
          'This is likely caused by an invalid percent-encoding.'
      )
    }
    else {
      throw e
    }
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

  location.key = key
  location.url = createPath(location)

  return location
}

export const getWindowLocation = (historyState, basename) => {
  const { key, state } = historyState || {}
  const { pathname, search, hash } = window.location
  let path = pathname + search + hash

  if (basename && hasBasename(path, basename)) {
    console.warn(`
      [rudy] You are attempting to use a basename on a page whose URL path does not begin
      with the basename. Expected path ${path} to begin with ${basename}.
    `)
  }

  if (basename) path = stripBasename(path, basename)
  return createLocation(path, state, key)
}

let _key = 0
export const createKey = () => _key++
