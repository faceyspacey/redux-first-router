// @flow
export const PREFIX = '@@rudy'
export const prefixType = (type: string) => `${PREFIX}/${type}`

export const UPDATE_HISTORY = prefixType('UPDATE_HISTORY')
export const NOT_FOUND = prefixType('NOT_FOUND')
export const ADD_ROUTES = prefixType('ADD_ROUTES')
export const COMPLETE = prefixType('COMPLETE')
export const ERROR = prefixType('ERROR')

export { default as createRouter } from './createRouter'

export { default as redirect } from './action-creators/redirect'
export { default as notFound } from './action-creators/notFound'
export { default as addRoutes } from './action-creators/addRoutes'
export { default as changeBasename } from './action-creators/changeBasename'

import * as history from './action-creators/history'
export { history }

export { default as actionToPath } from './utils/actionToPath'
export { default as pathToAction } from './utils/pathToAction'
export { default as isLocationAction } from './utils/isLocationAction'
export { default as doesRedirect } from './utils/doesRedirect'


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
