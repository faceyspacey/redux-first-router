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
  action: History,
  routes: RoutesMap,
  options: Options
): LocationState => {
  const { type, params = {}, query = {}, state = {}, hash = '', basename = '' } = action
  const { entries, index, length, pathname, search, url, key, n } = action.location

  const scene = typeToScene(type)
  const universal = isServer()
  const status = isNotFound(type) ? 404 : 200

  const direction = n === -1 ? 'backward' : 'forward'
  const prev = createPrev(action, routes, options, universal)

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
    direction,
    status,

    kind: 'init',
    entries,
    index,
    length,
    pop: false,

    universal,

    prev
  }
}

export const createPrev = (
  action,
  routes,
  opts,
  universal
) => {
  const { n, index, entries } = action.location // needs to use real lastIndex instead of -1
  const lastIndex = index + n // the entry action we want is the opposite of the direction the user is going
  const prevAction = entries[lastIndex]

  if (!prevAction) return createPrevEmpty(universal)

  const direction = n === -1 ? 'forward' : 'backward'
  const kind = n === -1 ? 'push' : 'back'

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

export const createPrevEmpty = (universal: boolean) => ({
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
