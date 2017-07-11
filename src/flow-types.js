// @flow
import type { Dispatch as ReduxDispatch, Store as ReduxStore } from 'redux'

export type Dispatch = ReduxDispatch<*>
export type GetState = () => Object
export type RouteString = string

export type RouteObject = {
  path: string,
  capitalizedWords?: boolean,
  toPath?: (param: string, key?: string) => string,
  fromPath?: (path: string, key?: string) => string,
  thunk?: (dispatch: Dispatch, getState: GetState) => any | Promise<any>,
  navKey?: string
}

export type Route = RouteString | RouteObject

export type RoutesMap = {
  [key: string]: Route
}

export type Router = {
  getStateForActionOriginal: (action: Object, state: ?Object) => ?Object,
  getStateForAction: (action: Object, state: ?Object) => ?Object,
  getPathAndParamsForState: (
    state: Object
  ) => { path: ?string, params: ?Object },
  getActionForPathAndParams: (path: string) => ?Object
}

export type Navigator = {
  router: Router
}

export type Navigators = {
  [key: string]: Navigator
}

export type Routes = Array<Route>
export type RouteNames = Array<string>

export type SelectLocationState = (state: Object) => LocationState
export type SelectTitleState = (state: Object) => string

export type Options = {
  title?: string | SelectTitleState,
  location?: string | SelectLocationState,
  notFoundPath?: string,
  scrollTop?: boolean,
  onBeforeChange?: (
    dispatch: Dispatch,
    getState: GetState,
    action: Action
  ) => void,
  onAfterChange?: (dispatch: Dispatch, getState: GetState) => void,
  onBackNext?: (dispatch: Dispatch, getState: GetState) => void,
  restoreScroll?: History => ScrollBehavior,
  initialDispatch?: boolean,
  navigators?: {
    navigators: Navigators,
    patchNavigators: (navigators: Navigators) => void,
    actionToNavigation: (
      navigators: Navigators,
      action: Object,
      navigationAction: ?NavigationAction,
      route: ?Route
    ) => Object,
    navigationToAction: (
      navigators: Navigators,
      store: Store,
      routesMap: RoutesMap,
      action: Object
    ) => {
      action: Object,
      navigationAction: ?NavigationAction
    }
  }
}

export type ScrollBehavior = Object

export type Params = Object
export type Payload = Object

export type LocationState = {
  pathname: string,
  type: string,
  payload: Payload,
  prev: Location,
  kind: ?string,
  history: ?HistoryData,
  routesMap: RoutesMap,
  hasSSR?: true
}

export type Location = {
  pathname: string,
  type: string,
  payload: Payload
}

export type ActionMetaLocation = {
  current: Location,
  prev: Location,
  kind: ?string,
  history: ?HistoryData
}

export type NavigationAction = {
  type: string,
  key?: ?string,
  navKey?: ?string,
  routeName?: string,
  actions?: Array<NavigationAction>,
  action?: NavigationAction,
  params?: Object,
  meta?: Object
}

export type Meta = {
  location: ActionMetaLocation,
  notFoundPath?: string,
  navigation?: NavigationAction
}

export type HistoryData = {
  entries: Array<{ pathname: string }>,
  index: number,
  length: number
}

export type Action = {
  type: string,
  payload: Payload,
  meta: Meta,
  navKey?: ?string
}

export type ReceivedAction = {
  type: string,
  payload: Payload,
  meta?: Object,
  navKey?: ?string
}

export type ReceivedActionMeta = {
  type: string,
  payload: Payload,
  navKey?: ?string,
  meta: {
    notFoundPath?: string
  }
}

export type Listener = (HistoryLocation, HistoryAction) => void
export type Listen = Listener => void
export type Push = (pathname: string) => void
export type Replace = (pathname: string) => void
export type GoBack = () => void
export type GoForward = () => void
export type Go = number => void
export type CanGo = number => boolean

export type History = {
  listen: Listen,
  push: Push,
  replace: Replace,
  goBack: GoBack,
  goForward: GoForward,
  go: Go,
  canGo: CanGo,
  entries: Array<{ pathname: string }>,
  index: number,
  length: number,
  location: {
    pathname: string
  }
}

export type HistoryLocation = {
  pathname: string
}

export type HistoryAction = string

export type Document = Object

export type Store = ReduxStore<*, *>
