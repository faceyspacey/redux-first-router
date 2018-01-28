import { isServer, isRedirect, actionToUrl } from '../utils'

export default (api) => (req, next) => {
  if (isServer() && isRedirect(req.action)) {
    const { action, routes } = req
    const url = actionToUrl(action, routes)
    action.url = action.location.url = url
    action.status = action.location.status || 302
    return action
  }

  return next()
}

