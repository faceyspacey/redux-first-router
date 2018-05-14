// @flow
import type { Dispatch as ReduxDispatch, Store as ReduxStore } from 'redux'

export type Dispatch = ReduxDispatch<*>
export type GetState = () => Object

export type BeforeLeave = (
  state: Object,
  action: Object,
  bag: Bag
) => any | Promise<any>

export type Bag = {
  action: ReceivedAction | Action | Location,
  extra: any
}

export type StandardCallback = (
  dispatch: Dispatch,
  getState: GetState,
  bag: Bag
) => ?any | Promise<any>

export type Route = {
  path?: string,
  capitalizedWords?: boolean,
  toPath?: Path,
  fromPath?: (path: string, key?: string) => string,
  toHash?: (hash: string, route: Route, opts: Options) => string,
  defaultHash?: Function | string,
  toSearch?: Function,
  beforeLeave?: BeforeLeave,
  beforeEnter?: StandardCallback,
  onEnter?: StandardCallback,
  onLeave?: StandardCallback,
  thunk?: StandardCallback,
  onComplete?: StandardCallback,
  onFail?: StandardCallback,
  navKey?: string,
  type?: string
}

export type RouteInput = Function | Route

export type RoutesMapInput = {
  [key: string]: RouteInput
}

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

export type QuerySerializer = {
  stringify: (params: Object) => string,
  parse: (queryString: string) => Object
}

export type ActionToNavigation = (
  navigators: Navigators,
  action: Object,
  navigationAction: ?NavigationAction,
  route: ?Route
) => Object

export type NavigationToAction = (
  navigators: Navigators,
  store: Store,
  routesMap: RoutesMap,
  action: Object
) => {
  action: Object,
  navigationAction: ?NavigationAction
}

export type Path = (
  val: string,
  key: string,
  encodedVal: string,
  route: Route,
  opts: Options
) => (string | Object)

export type Options = {
  title?: string | SelectTitleState,
  location?: string | SelectLocationState,
  notFoundPath?: string,
  scrollTop?: boolean,
  beforeLeave?: BeforeLeave,
  beforeEnter?: StandardCallback,
  onEnter?: StandardCallback,
  onLeave?: StandardCallback,
  thunk?: StandardCallback,
  onComplete?: StandardCallback,
  onFail?: StandardCallback,
  onBackNext?: StandardCallback,
  restoreScroll?: History => ScrollBehavior,
  querySerializer?: QuerySerializer,
  basename?: string,
  initialEntries?: string | Array<string>,
  createHistory?: (options?: Object) => History,
  defaultParams: Options,
  defaultState?: Object,
  toPath?: Path,
  toHash?: (hash: string, route: Route, opts: Options) => string,
  defaultHash?: Function | string,
  defaultQuery?: ?Object,
  toSearch?: any,
  navigators?: {
    navigators: Navigators,
    patchNavigators: (navigators: Navigators) => void,
    actionToNavigation: ActionToNavigation,
    navigationToAction: NavigationToAction
  },
  extra?: any
}

export type ScrollBehavior = Object

export type Params = Object
export type Payload = Object

export type LocationState = {
  pathname: string,
  type: string,
  payload: Payload,
  query?: Object,
  search?: string,
  prev: Location,
  kind: ?string,
  history: ?HistoryData,
  routesMap: RoutesMap,
  universal?: true
}

export type Location = {
  pathname: string,
  type: string,
  payload: Payload,
  query?: Object,
  search?: string
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
  navigation?: NavigationAction,
  query?: Object,
  search?: string
}

export type HistoryData = {
  entries: Array<{ pathname: string }>,
  index: number,
  length: number
}

export type Action = {
  meta: Meta,
  type: string,
  kind?: ?string,
  query?: Object,
  payload: Payload,
  navKey?: ?string
}

export type ReceivedAction = {
  type: string,
  meta?: Object,
  hash?: string,
  state?: Object,
  query?: Object,
  search?: string,
  params: ?Params,
  payload: Payload,
  navKey?: ?string,
  basename?: ?string
}

export type ReceivedActionMeta = {
  type: string,
  payload: Payload,
  query?: Object,
  navKey?: ?string,
  meta: {
    notFoundPath?: string,
    query?: Object,
    search?: string
  }
}

export type Listener = (HistoryLocation, HistoryAction) => void
export type Listen = Listener => void
export type Push = (pathname: string, state?: any) => void
export type Replace = (pathname: string, state?: any) => void
export type GoBack = () => void
export type GoForward = () => void
export type Go = number => void
export type CanGo = number => boolean
export type BlockFunction = (location: HistoryLocation) => any | Promise<any>

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
  location: HistoryLocation,
  block: (func: BlockFunction) => void
}

export type HistoryLocation = {
  pathname: string,
  search?: string
}

export type HistoryAction = string

export type Document = Object

export type Store = ReduxStore<*, *>

export type CreateActionsOptions = {
  logExports: ?boolean,
  scene: ?string,
  basename: ?string
}
