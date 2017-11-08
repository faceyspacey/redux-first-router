import { ADD_ROUTES } from '../index'
import formatRoutesMap from '../utils/formatRoutesMap'

export default (req, next) => {
  if (req.action && req.action.type === ADD_ROUTES) {
    Object.assign(req.routesMap, formatRoutesMap(req.action.payload.routes))
    return req.commitDispatch(req.action)
  }

  return next()
}

