// @flow
import { NOT_FOUND } from '../index'
import isServer from '../pure-utils/isServer'
import type { LocationState, RoutesMap, Action, Payload, History } from '../flow-types'


export default (
  initialState: LocationState,
  routesMap: RoutesMap,
) => (
  state: LocationState = initialState,
  action: Action,
): LocationState => {
  if (action.type === NOT_FOUND || (routesMap[action.type]
      && (action.meta.location.current.pathname !== state.pathname || action.meta.location.load))) {
    return {
      pathname: action.meta.location.current.pathname,
      type: action.type,
      payload: { ...action.payload },
      prev: action.meta.location.prev,
      load: action.meta.location.load,
      backNext: action.meta.location.backNext,
      redirect: action.meta.location.redirect,
      history: action.meta.location.history,
      hasSSR: state.hasSSR
      routesMap
    }
  }

  return state
}


export const getInitialState = (
  currentPathname: string,
  type: string,
  payload: Payload,
  routesMap: RoutesMap,
  history: History,
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
  redirect: undefined,
  history: !history.entries ? undefined : {
    entries: history.entries.map(entry => entry.pathname),
    index: history.index,
    length: history.length,
  },
  hasSSR: isServer() ? true : undefined,
  routesMap,
})

