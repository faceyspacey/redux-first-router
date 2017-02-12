// @flow
import { NOT_FOUND } from './actions'
import isServer from './pure-utils/isServer'
import type { LocationState, RoutesMap, Action, Payload } from './flow-types'


export default (
  initialState: LocationState,
  routesMap: RoutesMap,
) => (
  state: LocationState = initialState,
  action: Action,
): LocationState => {
  if (routesMap[action.type] || action.type === NOT_FOUND) {
    return {
      pathname: action.meta.location.current.pathname,
      type: action.type,
      payload: { ...action.payload },
      prev: action.meta.location.prev,
      load: action.meta.location.load,
      backNext: action.meta.location.backNext,
      hasSSR: state.hasSSR,
      routesMap,
    }
  }

  return state
}


export const getInitialState = (
  currentPathname: string,
  type: string,
  payload: Payload,
  routesMap: RoutesMap,
): LocationState => ({
  pathname: currentPathname,
  type,
  payload,
  prev: {
    pathname: '',
    type: '',
    payload: {},
  },
  load: undefined,
  backNext: undefined,
  hasSSR: isServer() ? true : undefined,
  routesMap,
})

