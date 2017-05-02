// @flow
import type { Dispatch as ReduxDispatch } from 'redux'

export type Dispatch = ReduxDispatch<*>
export type GetState = () => Object
export type RouteString = string

export type RouteObject = {
  path: string,
  capitalizedWords?: boolean,
  toPath?: (param: string, key?: string) => string,
  fromPath?: (path: string, key?: string) => string,
  thunk?: (dispatch: Dispatch, getState: GetState) => any | Promise<any>
}

export type Route = RouteString | RouteObject

export type RoutesMap = {
  [key: string]: Route
}

export type Routes = Array<Route>
export type RouteNames = Array<string>

export type Options = {
  title?: string,
  location?: string,
  scrollTop?: boolean,
  beforeChange?: (dispatch: Dispatch, getState: GetState) => void,
  afterChange?: (dispatch: Dispatch, getState: GetState) => void,
  onBackNext?: (dispatch: Dispatch, getState: GetState) => void,
  restoreScroll?: History => ScrollBehavior
}

export type ScrollBehavior = Object

export type Params = Object
export type Payload = Object

export type LocationState = {
  pathname: string,
  type: string,
  payload: Payload,
  prev: Location,
  load?: true,
  backNext?: true,
  redirect?: string,
  history: ?HistoryData,
  routesMap: RoutesMap,
  hasSSR?: true
}

export type Location = {
  pathname: string,
  type: string,
  payload: Payload
}

export type Meta = {
  location: {
    current: Location,
    prev: Location,
    load?: true,
    backNext?: true,
    redirect?: string,
    history: ?HistoryData
  }
}

export type HistoryData = {
  entries: Array<string>,
  index: number,
  length: number
}

export type Action = {
  type: string,
  payload: Payload,
  meta: Meta
}

export type ReceivedAction = {
  type: string,
  payload: Payload,
  meta?: Meta
}

export type Listener = HistoryLocation => void
export type Listen = Listener => void
export type Push = (pathname: string) => void
export type Replace = (pathname: string) => void
export type GoBack = () => void
export type GoForward = () => void
export type Go = number => void

export type History = {
  listen: Listen,
  push: Push,
  replace: Replace,
  goBack: GoBack,
  goForward: GoForward,
  go: Go,
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

export type Document = Object
