// @flow
import { compileUrl } from './index'
import { matchQuery, matchVal } from './matchUrl'

import type {
  Route,
  Payload,
  Params,
  RoutesMap,
  ReceivedAction as Action,
  Options
} from '../flow-types'

export default (
  action: Action,
  routes: RoutesMap,
  opts: Options = {},
  prevRoute?: Object
): string => {
  const { type, params, query, hash, state } = action
  const route = routes[type]
  const path = typeof route === 'object' ? route.path : route

  if (typeof path !== 'string') throw new Error('[rudy] invalid route path')

  toState(state, route, opts, action)

  try {
    return compileUrl(
      path,
      toParams(params, route, opts, action),
      toQuery(query, route, opts, action),
      toHash(hash, route, opts, action),
      route,
      opts
    ) || '/'
  }
  catch (e) {
    if (process.env.NODE_ENV === 'development') {
      console.error(`[rudy] unable to compile action "${type}" to URL`, action, e)
    }

    return notFoundUrl(action, routes, prevRoute)
  }
}

const toParams = (params: ?Object, route: Route, opts: Options, action) => {
  const def = route.defaultParams || opts.defaultParams
  params = def
    ? typeof def === 'function' ? def(params, route, opts) : { ...def, ...params }
    : params

  // unfortunate impurity to send defaults back to the original action as well
  if (def) action.params = params

  if (params) {
    const newParams = {}
    const to = route.toParam || defaultToParam

    for (const key in params) {
      const val = params[key]
      const encodedVal = encodeURIComponent(val)
      const res = to(val, key, encodedVal, route, opts)
      newParams[key] = res
    }

    return newParams
  }
}

const defaultToParam = (
  val: string,
  key: string,
  encodedVal: string,
  route: Route,
  opts: Options
) => {
  if (typeof val === 'string' && val.indexOf('/') > -1) { // support a parameter that for example is a file path with slashes (like on github)
    return val.split('/').map(encodeURIComponent) // path-to-regexp supports arrays for this use case
  }

  const capitalize = route.capitalizedWords ||
    (opts.capitalizedWords && route.capitalizedWords !== false)

  if (capitalize && typeof val === 'string') {
    return val.replace(/ /g, '-').toLowerCase()
  }

  return opts.toParam
    ? opts.toParam(val, key, encodedVal, route, opts)
    : val === undefined ? undefined : encodedVal
}

const toQuery = (query: ?Object, route: Route, opts: Options, action) => {
  const def = route.defaultQuery || opts.defaultQuery
  query = def
    ? typeof def === 'function' ? def(query, route, opts) : { ...def, ...query }
    : query

  // unfortunate impurity to send defaults back to the original action as well
  if (def) action.query = query

  const to = route.toQuery || opts.toQuery

  if (to && query) {
    const newQuery = {}

    for (const key in query) {
      newQuery[key] = to(query[key], key, route, opts)
    }

    return newQuery
  }

  return query
}

const toState = (state: ?Object, route: Route, opts: Options, action) => {
  const def = route.defaultState || opts.defaultState
  state = def
    ? typeof def === 'function' ? def(state, route, opts) : { ...def, ...state }
    : state

  // unfortunate impurity to send defaults back to the original action as well
  if (def) action.state = state

  const to = route.toState || opts.toState

  if (to && state) {
    const newState = {}

    for (const key in state) {
      newState[key] = to(state[key], key, route, opts)
    }

    return newState
  }

  return state
}

const toHash = (hash: ?string = '', route: Route, opts: Options, action) => {
  const def = route.defaultHash || opts.defaultHash
  hash = def
    ? typeof def === 'function' ? def(hash, route, opts) : (hash || def)
    : hash

  // unfortunate impurity to send defaults back to the original action as well
  if (def) action.hash = hash

  const to = route.toHash || opts.toHash
  return to ? to(hash, route, opts) : hash
}

const notFoundUrl = (action, routes, prevRoute: Object = {}) => {
  const route = routes[action.type] || {}
  const hasScene = action.type.indexOf('/NOT_FOUND') > -1
  const scene = route.scene || prevRoute.scene || ''

  action.type = hasScene
    ? action.type
    : routes[`${scene}/NOT_FOUND`] // try to interpret scene-level NOT_FOUND if available (note: links create plain NOT_FOUND actions)
      ? `${scene}/NOT_FOUND`
      : 'NOT_FOUND'

  return routes[action.type].path || routes.NOT_FOUND.path
}
