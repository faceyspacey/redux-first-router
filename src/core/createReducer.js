// @flow
import { ADD_ROUTES, BLOCK, UNBLOCK, SET_FROM } from '../types'
import { isServer, typeToScene, isNotFound } from '../utils'

import type {
  LocationState,
  RoutesMap,
  Action,
  History,
  Options
} from '../flow-types'

export default (
  initialState: Object,
  routes: RoutesMap,
  history: History,
  options: Options
) => (
  st: LocationState = initialState,
  action: Action
): LocationState => {
  const r = routes[action.type]
  const l = action.location

  if (r && r.path && (l.url !== st.url || /load|reset/.test(l.kind))) {
    const { type, params, query, state, hash, basename } = action
    const universal = st.universal
    const s = { type, params, query, state, hash, universal, basename, ...l }
    if (st.ready === false) s.ready = true
    return s
  }

  if (action.type === ADD_ROUTES) {
    const { routesAdded } = action.payload
    return { ...st, routesAdded }
  }

  if (l && l.kind === 'setState') {
    const { state, location: { entries } } = action
    return { ...st, state, entries }
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

  if (action.type === BLOCK) {
    const { ref } = action.payload
    return { ...st, blocked: ref }
  }

  if (action.type === UNBLOCK) {
    const { blocked, ...state } = st
    return state
  }

  if (action.type === SET_FROM) {
    const { ref } = action.payload
    return { ...st, from: ref }
  }

  return st
}


export const createInitialState = (
  routes: RoutesMap,
  action: History,
  options: Options
): LocationState => {
  const { type, params = {}, query = {}, state = {}, hash = '', basename = '' } = action
  const { entries, index, length, pathname, search, url, key } = action.location

  const scene = typeToScene(type)
  const universal = isServer()
  const status = isNotFound(type) ? 404 : 200

  return {
    type,
    params,
    query,
    hash,
    state,

    url,
    pathname,
    search,
    key,
    basename: basename.substr(1),
    scene,
    direction: 'forward',
    status,

    kind: 'init',
    entries,
    index,
    length,
    pop: false,

    universal,

    prev: createPrevEntries(routes, action, options, universal)
  }
}

export const createPrev = (universal: boolean) => ({
  type: '',
  params: {},
  query: {},
  hash: '',
  state: {},

  url: '',
  pathname: '',
  search: '',
  key: '',
  basename: '',
  scene: '',
  direction: 'forward',

  kind: '',
  entries: [],
  index: -1,
  length: 0,

  universal
})

export const createPrevEntries = (
  routes,
  action,
  opts,
  universal
) => {
  const { index, lastIndex = 1, entries } = action.location // needs to use real lastIndex instead of -1
  const n = index > lastIndex ? -1 : 1
  const prevAction = entries[n]

  if (!prevAction) return createPrev(universal)

  const direction = index > lastIndex ? 'forward' : 'backward'
  const kind = direction === 'forward' ? 'push' : 'back'

  const { location, ...act } = prevAction
  const { basename = '' } = act
  const { url, pathname, search, key } = location
  const scene = routes[act.type].scene || ''

  return {
    ...act,

    basename: basename.substr(1),
    url,
    pathname,
    search,
    key,
    scene,
    direction,

    kind,
    entries,
    index: lastIndex,
    length: entries.length,

    universal
  }
}
