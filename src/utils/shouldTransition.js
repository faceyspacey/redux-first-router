import { PREFIX, BLOCK, UNBLOCK } from '../types'

export default (action, { routes }) => {
  const { type } = action
  const route = routes[type]
  return (route || (type && type.indexOf(PREFIX) > -1)) && !action.error
}
