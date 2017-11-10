import isLocationAction from './isLocationAction'
import { PREFIX } from '../index'

export default (action, { routes }) => {
  const { type } = action
  const route = routes[type] || (type && type.indexOf(PREFIX) === 0)
  const handled = isLocationAction(action) || !route || action.error
  const fromHistory = !!action.nextHistory

  return !handled || fromHistory
}
