// @flow

export {
  default as createRouter,
  history
  // push,
  // replace,
  // back,
  // next,
  // go,
  // canGo,
  // canGoBack,
  // canGoForward,
  // prevPath,
  // nextPath,
  // history,
  // scrollBehavior,
  // updateScroll,
} from './createRouter'

export const PREFIX = '@@rudy'
export const prefixType = (type: string) => `${PREFIX}/${type}`

export const UPDATE_HISTORY = prefixType('UPDATE_HISTORY')
export const NOT_FOUND = prefixType('NOT_FOUND')
export const ADD_ROUTES = prefixType('ADD_ROUTES')
export const SET_STATE = prefixType('SET_STATE')
export const ERROR = prefixType('ERROR')

export { default as redirect } from './action-creators/redirect'

export { default as actionToPath } from './utils/actionToPath'
export { default as pathToAction } from './utils/pathToAction'
export { default as isLocationAction } from './utils/isLocationAction'
export { default as addRoutes } from './action-creators/addRoutes'

export type {
  RouteInput,
  Route,
  RoutesMap,
  Routes,
  RouteNames,
  Options,
  Params,
  Payload,
  LocationState,
  Location,
  Meta,
  Action,
  ReceivedAction,
  Listener,
  Listen,
  Push,
  GoBack,
  History,
  HistoryLocation,
  Document,
  Navigators,
  Navigator,
  Store,
  NavigationAction,
  Router
} from './flow-types'
