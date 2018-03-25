import { isServer, isRedirect, actionToUrl } from '../utils'

export default (api) => (req, next) => {
  if (isServer() && isRedirect(req.action)) {
    const { action } = req
    const { url } = actionToUrl(action, api)

    action.url = action.location.url = url
    action.status = action.location.status || 302

    // account for anonymous thunks potentially redirecting without returning itself
    // and not able to be discovered by regular means in `utils/createRequest.js`
    req.ctx.serverRedirect = true

    return action
  }

  return next()
}

