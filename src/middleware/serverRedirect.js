import isServer from '../utils/isServer'
import isRedirect from '../utils/isRedirect'
import actionToPath from '../utils/actionToPath'

export default (api) => (req, next) => {
  if (isServer() && isRedirect(req.action)) {
    const { action, routes, options } = req
    const url = actionToPath(action, routes, options.querySerializer)
    action.meta.location.url = url
    return action
  }

  return next()
}

