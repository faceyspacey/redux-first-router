// @flow
import { NOT_FOUND, ADD_ROUTES } from './index'
import isServer from './utils/isServer'
import pathToAction from './utils/pathToAction'

import type {
  LocationState,
  RoutesMap,
  Action,
  Options,
  History,
  ReceivedAction
} from './flow-types'

export default (routes: RoutesMap, history: History, options: Options) => {
  const initialState = createInitialState(routes, history, options)

  return (
    state: LocationState = initialState,
    action: Action
  ): LocationState => {
    const route = routes[action.type]

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
      const payload = action.payload || {}
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
    else if (action.type === ADD_ROUTES) {
      const count = Object.keys(action.payload.routes).length     // we need to be able to update Links when new routes are added
      const routesAdded = (state.routesAdded || 0) + count        // we could just increment a number, but this is more informative
      return { ...state, routesAdded }
    }
    else if (action.type.indexOf('ERROR') > -1) {
      const { error, type: errorType } = action
      return { ...state, error, errorType }
    }

    return state
  }
}

export const createInitialState = (
  routes: RoutesMap,
  history: History,
  options: Options
): LocationState => {
  const path = history.location.url
  const initialAction = pathToAction(path, routes, options.basename)
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
