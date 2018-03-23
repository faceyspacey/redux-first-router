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

  return st
}


export const createInitialState = (
  action: History,
  routes: RoutesMap,
  options: Options
): LocationState => {
  const { type, params = {}, query = {}, state = {}, hash = '', location } = action
  const { entries, index, length, pathname, search, url, key, n } = location
  const basename = action.basename ? action.basename.substr(1) : ''
  const scene = typeToScene(type)
  const universal = isServer()
  const status = isNotFound(type) ? 404 : 200
  const direction = n === -1 ? 'backward' : 'forward'
  const prev = createPrev(location, routes, options)

  return {
    kind: 'init',
    direction,

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
    status
  }
}

export const createPrev = (
  location,
  routes,
  opts,
) => {
  const { n, index, entries, length } = location // needs to use real lastIndex instead of -1
  const n2 = n * -1
  const lastIndex = index + n2 // the entry action we want is the opposite of the direction the user is going
  const prevAction = entries[lastIndex]

  if (!prevAction) return createPrevEmpty()

  const { location: loc, ...action } = prevAction
  const { url, pathname, search, key } = loc
  const basename = action.basename ? action.basename.substr(1) : ''
  const scene = routes[action.type].scene || ''

  return {
    ...action,
    basename,
    location: {
      url,
      pathname,
      search,
      key,
      scene,
      index: lastIndex
    }
  }
}

export const createPrevEmpty = () => ({
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
    index: -1
  }
})
