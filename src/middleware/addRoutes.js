import { ADD_ROUTES } from '../types'
import { formatRoutesMap } from '../utils'

export default (api) => (req, next) => {
  if (req.action && req.action.type === ADD_ROUTES) {
    const newRoutes = formatRoutesMap(req.action.payload.routes, true)
    Object.assign(req.routes, newRoutes)
    return req.commitDispatch(req.action)
  }

  return next()
}
