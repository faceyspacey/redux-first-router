import isServer from '../utils/isServer'
import isRedirect from '../utils/isRedirect'
import actionToPath from '../utils/actionToPath'

export default (req, next) => {
  if (isServer() && isRedirect(req.action)) {
    const { action, routesMap, options } = req
    const url = actionToPath(action, routesMap, options.querySerializer)
    action.meta.location.url = url
    return action
  }

  return next()
}

