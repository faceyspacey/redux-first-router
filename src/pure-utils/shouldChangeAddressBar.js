// @flow
import type { LocationState } from '../flow-types'


export default (
  locationState: LocationState,
  currentPathname: string,
): boolean =>
  locationState.pathname !== currentPathname
