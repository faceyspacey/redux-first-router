// @flow
import * as supports from './history/utils/supports'
import * as popListener from './history/utils/popListener'
import * as sessionStorage from './history/utils/sessionStorage'

export { default as createRouter } from './core/createRouter'
export { default as createScene } from './createScene'

export { default as createHistory } from './core/createHistory'
export { default as History } from './history/History'
export { default as MemoryHistory } from './history/MemoryHistory'
export { default as BrowserHistory } from './history/BrowserHistory'

export const utils = {
  supports,
  popListener,
  sessionStorage,
}

export * from './types'
export * from './actions'
export * from './utils'
export * from './middleware'

/** if you want to extend History, here is how you do it:

import History from '@respond-framework/rudy'

class MyHistory extends History {
  push(path) {
    const location = this.createAction(path)
    // do something custom
  }
}

// usage:

import { createRouter } from '@respond-framework/rudy'
import { createHistory as creatHist } from '@respond-framework/rudy'

const createHistory = (routes, opts) => {
  if (opts.someCondition) return new MyHistory(routes, opts)
  return creatHist(routes, opts)
}

const { middleware, reducer, firstRoute } = createRouter(routes, { createHistory })

*/

export type {
  RouteInput,
  Route,
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
  History as HistoryType,
  HistoryLocation,
  Document,
  Navigators,
  Navigator,
  Store,
  NavigationAction,
  Router,
} from './flow-types'
