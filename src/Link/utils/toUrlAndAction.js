// @flow
import resolvePathname from 'resolve-pathname'
import { actionToUrl, urlToAction } from '../../utils'
import { stripBasename, findBasename } from '../../history/utils'
import { changeBasename } from '../../actions'
import type { RoutesMap } from '../../flow-types'

export type To = string | Array<string> | Object

export default (
  to?: ?To,
  routes: RoutesMap,
  basenames: ?Array<string>,
  basename: ?string = '',
  currentPathname: string
): string => {
  let url = ''
  let action

  if (!to) {
    url = '#'
  }
  if (to && typeof to === 'string') {
    url = to
  }
  else if (Array.isArray(to)) {
    if (to[0].charAt(0) === '/') {
      basename = to.shift()
    }

    url = `/${to.join('/')}`
  }
  else if (typeof to === 'object') {
    action = to

    try {
      url = actionToUrl(action, routes)
      basename = (action.location && action.location.basename) || basename
    }
    catch (e) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[rudy/Link] could not create path from action:', action)
      }

      url = '#'
    }
  }

  const bn = basenames && findBasename(url, basenames)

  if (bn) {
    basename = bn
    url = stripBasename(url, bn)
  }

  if (url.charAt(0) === '#') {
    url = `${currentPathname}${url}`
  }
  else if (url.charAt(0) !== '/') {
    url = resolvePathname(url, currentPathname)
  }

  const isExternal = url.indexOf('http') === 0

  if (!action && !isExternal) {
    action = urlToAction(url, routes)
  }

  if (basename) {
    action = changeBasename(basename, action)
  }

  const fullUrl = isExternal ? url : basename + url
  return { fullUrl, action }
}
