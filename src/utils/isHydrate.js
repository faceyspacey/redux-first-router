// @flow
import type { LocationState } from '../flow-types'
import { isServer } from './index'

export default (req): boolean => {
  const { hasSSR } = req.getLocation()
  return hasSSR && !isServer() && req.getKind() === 'load'
}


