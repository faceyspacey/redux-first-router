import { PREFIX } from '../types'

export default (action, { routes }) => {
  const { type = '' } = action
  const route = routes[type]
  return route || type.indexOf(PREFIX) > -1
}
