// @flow
import type { History, LocationState } from '../flow-types'


export default (
  locationState: LocationState,
  currentPathname: string,
  history: History,
): string => {
  if (locationState.pathname !== currentPathname) {
    history.push({ pathname: locationState.pathname })
  }

  return locationState.pathname
}
