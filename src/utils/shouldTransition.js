import isLocationAction from './isLocationAction'
import { PREFIX, UPDATE_HISTORY } from '../index'

export default (action, { routes }) => {
  const { type } = action
  const route = routes[type] || (type && type.indexOf(PREFIX) > -1)
  return route && !isLocationAction(action)
}
