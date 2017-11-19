// @flow
import { NOT_FOUND, ADD_ROUTES, SET_STATE } from './index'
import isServer from './utils/isServer'
import pathToAction from './utils/pathToAction'
import typeToScene from './utils/typeToScene'

import type {
  LocationState,
  RoutesMap,
  Action,
  Options,
  History,
  ReceivedAction
} from './flow-types'

export default (routes: RoutesMap, history: History) => {
  const initialState = createInitialState(routes, history)

  return (
    st: LocationState = initialState,
    action: Action
  ): LocationState => {
    const route = !action.error && routes[action.type]
    const loc = action.location

    if (route && route.path && (loc.url !== st.url || loc.kind === 'load')) {
      const { type, payload, query, state, hash } = action
      return { type, payload, query, state, hash, hasSSR: st.hasSSR, ...loc }
    }
    else if (action.type === ADD_ROUTES) {
      const count = Object.keys(action.payload.routes).length     // we need to be able to update Links when new routes are added
      const routesAdded = (st.routesAdded || 0) + count        // we could just increment a number, but why not at least off some info
      return { ...st, routesAdded }
    }
    else if (action.type === SET_STATE) {
      const { state } = action
      const entries = st.entries.slice(0)
      entries[st.index] = { ...entries[st.index], state }
      return { ...st, state, entries }
    }
    else if (action.type.indexOf('ERROR') > -1) {
      const { error, type: errorType } = action
      return { ...st, error, errorType }
    }

    return st
  }
}

export const createInitialState = (
  routes: RoutesMap,
  history: History
): LocationState => {
  const { kind, entries, index, length, location, basename } = history
  const { url, pathname, search } = location
  const action = pathToAction(location, routes, basename)
  const { type, payload = {}, query = {}, state = {}, hash = '' } = action
  const scene = typeToScene(type)

  return {
    type,
    payload,
    query,
    state,
    hash,

    url,
    pathname,
    search,
    basename,
    scene,

    kind: 'init',
    entries,
    index,
    length,

    hasSSR: isServer() ? true : undefined,

    prev: {
      type: '',
      payload: {},
      query: {},
      state: {},
      hash: '',

      url: '',
      pathname: '',
      search: '',
      basename: '',
      scene: '',

      kind: '',
      entries: [],
      index: -1,
      length: 0
    }
  }
}

