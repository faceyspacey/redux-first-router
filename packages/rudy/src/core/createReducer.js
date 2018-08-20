// @flow
import { ADD_ROUTES, BLOCK, UNBLOCK, SET_FROM } from '../types'
import { isServer, typeToScene, isNotFound } from '../utils'

import type {
  LocationState,
  Routes,
  Action,
  CreateReducerAction,
  Prev,
} from '../flow-types'

export default (initialState: Object, routes: Routes) => (
  st: LocationState = initialState,
  action: CreateReducerAction,
): LocationState => {
  const r = routes[action.type]
  const l = action.location
  if (l && l.kind === 'set') {
    const {
      commit,
      location: { kind, ...location },
      ...act
    } = action
    return { ...st, ...act, ...location }
  }

  if (r && r.path && (l.url !== st.url || /load|reset/.test(l.kind))) {
    const { type, params, query, state, hash, basename } = action
    const { universal } = st
    const s = { type, params, query, state, hash, basename, universal, ...l }
    if (st.ready === false) s.ready = true
    return s
  }

  if (action.type === ADD_ROUTES) {
    const { routesAdded } = action.payload
    return { ...st, routesAdded }
  }

  if (action.type === SET_FROM) {
    const { ref } = action.payload
    return { ...st, from: ref }
  }

  if (action.type === BLOCK) {
    const { ref } = action.payload
    return { ...st, blocked: ref }
  }

  if (action.type === UNBLOCK) {
    return { ...st, blocked: null }
  }

  if (action.type.indexOf('_ERROR') > -1) {
    const { error, type: errorType } = action
    return { ...st, error, errorType }
  }

  if (action.type.indexOf('_COMPLETE') > -1) {
    return { ...st, ready: true }
  }

  if (action.type.indexOf('_START') > -1) {
    return { ...st, ready: false }
  }

  return st
}

export const createInitialState = (action: Action): LocationState => {
  const { location, type, basename, params, query, state, hash } = action
  const {
    entries,
    index,
    length,
    pathname,
    search,
    url,
    key,
    scene,
    n,
  } = location

  const direction = n === -1 ? 'backward' : 'forward'
  const prev = createPrev(location)
  const universal = isServer()
  const status = isNotFound(type) ? 404 : 200

  return {
    kind: 'init',
    direction,
    n,

    type,
    params,
    query,
    state,
    hash,
    basename,

    url,
    pathname,
    search,
    key,
    scene,

    prev,
    from: null,
    blocked: null,

    entries,
    index,
    length,

    universal,
    pop: false,
    status,
  }
}

export const createPrev = (location: {
  n: number,
  index: number,
  entries: Array<{ pathname: string, location: Object }>,
}) => {
  const { n, index: i, entries } = location // needs to use real lastIndex instead of -1
  const index = i + n * -1 // the entry action we want is the opposite of the direction the user is going
  const prevAction = entries[index]

  if (!prevAction) return createPrevEmpty()

  return {
    ...prevAction,
    location: {
      ...prevAction.location,
      index,
    },
  }
}

export const createPrevEmpty = (): Prev => ({
  type: '',
  params: {},
  query: {},
  state: {},
  hash: '',
  basename: '',
  location: {
    url: '',
    pathname: '',
    search: '',
    key: '',
    scene: '',
    index: -1,
  },
})
