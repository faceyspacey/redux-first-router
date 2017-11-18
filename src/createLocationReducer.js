// @flow
import { NOT_FOUND, ADD_ROUTES } from './index'
import isServer from './utils/isServer'
import pathToAction from './utils/pathToAction'
import typeToScene from '../utils/typeToScene'

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

    if (route && route.path &&
        (action.meta.location.current.url !== state.url ||
          action.meta.location.kind === 'load')
    ) {
      const query = action.meta.location.current.payload.query
      const search = action.meta.location.current.search
      const payload = action.payload || {}
      delete payload.query

      return {
        url: action.meta.location.current.url,
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
    else if (action.type.indexOf('_ERROR') > -1) {
      const { error, type: errorType } = action
      return { ...state, error, errorType }
    }

    return state
  }
}


const foo = (routes: RoutesMap, history: History, options: Options) => {
  const initialState = createInitialState(routes, history, options)

  return (
    state: LocationState = initialState,
    action: Action
  ): LocationState => {
    const route = routes[action.type]
    const loc = action.location

    if (route && route.path && (loc.url !== state.url || loc.kind === 'load')) {
      const { type, payload, query, state, hash } = action
      return { type, payload, query, state, hash, ...action.location }
    }
    else if (action.type === ADD_ROUTES) {
      const count = Object.keys(action.payload.routes).length     // we need to be able to update Links when new routes are added
      const routesAdded = (state.routesAdded || 0) + count        // we could just increment a number, but why not at least off some info
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
  const { url } = history.location
  const parts = url.split('?')
  const pathname = parts[0]
  const initialAction = pathToAction(url, routes, options.basename)
  const { type, payload, meta }: ReceivedAction = initialAction

  return {
    url,
    pathname,
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

export const createInitialState2 = (
  routes: RoutesMap,
  history: History,
  options: Options
): LocationState => {
  const { kind, entries, index, length, location: { url } } = history
  const parts = url.split('?')
  const pathname = parts[0]
  const search = parts[1] || ''

  const { type, payload = {} } = pathToAction(url, routes, options.basename)

  return {
    url,
    pathname,
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

export const createInitialState2 = (
  routes: RoutesMap,
  history: History,
  options: Options
): LocationState => {
  const { kind, entries, index, length, location } = history
  const { url, pathname, search } = location
  const action = pathToAction(url, routes, options.basename)
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

    prev,

    kind,
    entries,
    index,
    length
  }
}
