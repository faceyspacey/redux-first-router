import { isServer, isRedirect, actionToUrl } from '../utils'
import { formatSlashes } from '../history/utils'

export default (api) => (req, next) => {
  if (isServer() && isRedirect(req.action)) {
    const { action, routes, options } = req
    const path = actionToUrl(action, routes, options)

    let basename = action.basename || req.getLocation().basename
    basename = basename ? formatSlashes(basename) : ''

    action.url = action.location.url = basename + path
    action.status = action.location.status || 302

    // account for anonymous thunks potentially redirecting without returning itself
    // and not able to be discovered by regular means in `utils/createRequest.js`
    req.ctx.serverRedirect = true

    return action
  }

  return next()
}

