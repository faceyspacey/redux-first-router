import { isTransformed } from './index'
import { PREFIX } from '../types'

export default (action, { routes }) => {
  const { type } = action
  const route = routes[type] || (type && type.indexOf(PREFIX) > -1)
  return route && !isTransformed(action)
}
