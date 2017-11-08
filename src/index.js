// @flow

export {
  default as createRouter,
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
  getOptions,
  history,
  getLocationState,
} from './createRouter'

export const NOT_FOUND = '@@redux-first-router/NOT_FOUND'
export const ADD_ROUTES = '@@redux-first-router/ADD_ROUTES'

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
