import { ADD_ROUTES } from '../index'
import formatRoutes from '../utils/formatRoutes'

export default (api) => (req, next) => {
  if (req.action && req.action.type === ADD_ROUTES) {
    Object.assign(req.routes, formatRoutes(req.action.payload.routes, true))
    return req.commitDispatch(req.action)
  }

  return next()
}

