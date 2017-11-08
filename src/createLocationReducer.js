// @flow
import { NOT_FOUND, ADD_ROUTES } from './index'
import isServer from './utils/isServer'
import pathToAction from './utils/pathToAction'

import type {
  LocationState,
  RoutesMap,
  Action,
  Payload,
  History,
  ReceivedAction
} from './flow-types'

export default (routesMap: RoutesMap, history: History) => {
  const initialState = createInitialState(routesMap, history)

  return (
    state: LocationState = initialState,
    action: Action
  ): LocationState => {
    routesMap = state.routesMap || routesMap
    const route = routesMap[action.type]

    if (
      action.type === NOT_FOUND ||
      (route &&
        !action.error &&
        (typeof route === 'string' || route.path) &&
        (action.meta.location.current.pathname !== state.pathname ||
          action.meta.location.current.search !== state.search ||
          action.meta.location.kind === 'load'))
    ) {
      const query = action.meta.location.current.payload.query
      const search = action.meta.location.current.search
      const payload = { ...action.payload }
      delete payload.query

      return {
        pathname: action.meta.location.current.pathname,
        type: action.type,
        payload,
        ...(query && { query, search }),
        prev: action.meta.location.prev,
        kind: action.meta.location.kind,
        basename: action.meta.location.basename,
        entries: action.meta.location.history.entries,
        index: action.meta.location.history.index,
        length: action.meta.location.history.length,
        hasSSR: state.hasSSR
      }
    }

    return state
  }
}

export const createInitialState = (
  routesMap: RoutesMap,
  history: History
): LocationState => {
  const path = history.location.url
  const initialAction = pathToAction(path, routesMap)
  const { type, payload, meta }: ReceivedAction = initialAction

  return {
    pathname: path.split('?')[0],
    type,
    payload,
    ...meta,
    prev: {
      pathname: '',
      type: '',
      payload: {},
      kind: '',
      index: -1,
      length: 0
    },
    kind: 'init',
    entries: history.entries,
    index: history.index,
    length: history.length,
    hasSSR: isServer() ? true : undefined // client uses initial server `hasSSR` state setup here
  }
}
