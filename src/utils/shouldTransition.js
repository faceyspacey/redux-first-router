import isLocationAction from './isLocationAction'
import { ADD_ROUTES } from '../index'

export default (action, routesMap) => {
  const route = routesMap[action.type] || action.type === ADD_ROUTES
  const handled = isLocationAction(action) || !route || action.error
  const fromHistory = !!action.nextHistory

  return !handled || fromHistory
}
