// @flow
import type { LocationState } from '../flow-types'
import { isServer } from './index'

export default (req): boolean => {
  const { universal } = req.getLocation()
  return universal && !isServer() && req.getKind() === 'load'
}


