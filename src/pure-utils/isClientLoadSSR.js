// @flow
import type { Store } from '../flow-types'
import isServer from './isServer'
import { selectLocationState } from '../connectRoutes'

export default (store: Store): boolean => {
  const state = selectLocationState(store.getState())
  return !isServer() && state.kind === 'load' && !!state.hasSSR
}
