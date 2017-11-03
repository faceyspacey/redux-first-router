// @flow
import type { LocationState } from '../flow-types'
import isServer from './isServer'
import { selectLocationState } from '../connectRoutes'

export default (state: LocationState): boolean =>
  !isServer() && state.kind === 'load' && !!state.hasSSR

