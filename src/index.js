// @flow
export {
  default as connectRoutes,
  push,
  replace,
  back,
  next,
  go,
  canGo,
  canGoBack,
  canGoForward,
  prevPath,
  nextPath,
  history,
  scrollBehavior,
  updateScroll,
  selectLocationState,
  getOptions
} from './connectRoutes'

export const NOT_FOUND = '@@redux-first-router/NOT_FOUND'
export const ADD_ROUTES = '@@redux-first-router/ADD_ROUTES'

export { default as redirect } from './action-creators/redirect'

export { default as actionToPath } from './pure-utils/actionToPath'
export { default as pathToAction } from './pure-utils/pathToAction'
export { default as isLocationAction } from './pure-utils/isLocationAction'
export { default as setKind } from './pure-utils/setKind'
export { default as addRoutes } from './action-creators/addRoutes'

export type {
  RouteString,
  RouteObject,
  Route,
  RoutesMap,
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
