import isLocationAction from './isLocationAction'
import { PREFIX, UPDATE_HISTORY } from '../index'

export default (action, { routes }) => {
  const { type } = action
  const route = routes[type] || (type && type.indexOf(PREFIX) === 0)
  const handled = isLocationAction(action) || !route || action.error
  const fromHistory = action.type === UPDATE_HISTORY

  return !handled || fromHistory
}
