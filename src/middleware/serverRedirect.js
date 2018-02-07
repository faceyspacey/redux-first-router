import { isServer, isRedirect, actionToUrl } from '../utils'
import { formatSlashes } from '../history/utils'

export default (api) => (req, next) => {
  if (isServer() && isRedirect(req.action)) {
    const { action, routes, options } = req
    const url = actionToUrl(action, routes, options)

    let basename = action.basename || req.getLocation().basename
    basename = basename ? formatSlashes(basename) : ''

    action.url = action.location.url = basename + url
    action.status = action.location.status || 302

    return action
  }

  return next()
}

