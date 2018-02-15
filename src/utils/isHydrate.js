// @flow
import type { LocationState } from '../flow-types'
import { isServer } from './index'

export default (req): boolean => {
  const { kind, hasSSR } = req.getLocation()
  return !isServer() && /init|load/.test(kind) && hasSSR
}

