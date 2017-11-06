// @flow
import type { LocationState } from '../flow-types'
import isServer from './isServer'
import { selectLocationState } from '../connectRoutes'

export default (state: LocationState, kind = 'load'): boolean =>
  !isServer() && state.kind === kind && !!state.hasSSR

