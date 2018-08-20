// @flow
import { isServer } from './index'

export default (req: Object): boolean => {
  const { universal } = req.getLocation()
  return universal && !isServer() && req.getKind() === 'load'
}
