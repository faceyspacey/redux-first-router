import resolvePathname from 'resolve-pathname'
import { urlToLocation, locationToUrl, stripBasename, findBasename, formatSlashes } from './index'
import { urlToAction } from '../../utils'

export default (loc, routes, opts, state, key, basename, curr = {}) => {
  if (typeof loc === 'string') {
    const foundBasename = findBasename(loc, opts.basenames)
    loc = foundBasename ? stripBasename(loc, foundBasename) : loc
    basename = foundBasename || basename
  }

  const { scene } = routes[curr.type] || {}
  const location = createLocation(loc, state, key, basename, curr)
  const action = urlToAction(location, routes, opts, scene)

  delete location.basename // these are needed for `urlToAction`, but `urlToAction` then puts them on the action instead of `action.location`
  delete location.hash
  delete location.state

  return {
    ...action,
    location
  }
}

const createLocation = (loc, state, key, basename, curr) => {
  loc = typeof loc === 'string'
    ? urlToLocation(loc)
    : { ...loc, search: loc.search || '', hash: loc.hash || '' }

  if (!loc.pathname) {
    loc.pathname = curr.pathname || '/'
  }
  else if (curr.pathname && loc.pathname.charAt(0) !== '/') {
    loc.pathname = resolvePathname(loc.pathname, curr.pathname) // Resolve incomplete/relative pathname relative to current location.
  }

  loc.state = { ...loc.state, ...state }
  loc.key = loc.key || key || Math.random().toString(36).substr(2, 6)
  loc.basename = formatSlashes(loc.basename || basename || curr.basename || '')
  loc.url = loc.basename + locationToUrl(loc)

  return loc
}

