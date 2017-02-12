// @flow
import type { Dispatch as ReduxDispatch } from 'redux'

export type Dispatch = ReduxDispatch<*>
export type GetState = () => Object // eslint-disable-line flowtype/no-weak-types
export type RouteString = string

export type RouteObject = {
  path: string,
  capitalizedWords?: boolean,
  toPath?: (param: string, key?: string) => string,
  fromPath?: (path: string, key?: string) => string,
  thunk?: (dispatch: Dispatch, getState: GetState) => void,
}

export type Route = RouteString | RouteObject

export type RoutesMap = {
  [key: string]: Route,
}

export type Routes = Array<Route>
export type RouteNames = Array<string>

export type Options = {
  onBackNext?: (HistoryLocation) => void,
  title?: string,
  location?: string,
}

export type Params = Object // eslint-disable-line flowtype/no-weak-types
export type Payload = Object // eslint-disable-line flowtype/no-weak-types

export type LocationState = {
  pathname: string,
  type: string,
  payload: Payload,
  prev: Location,
  load?: true,
  backNext?: true,
  routesMap: RoutesMap,
  hasSSR?: boolean,
}

export type Location = {
  pathname: string,
  type: string,
  payload: Payload,
}

export type Meta = {
  location: {
    current: Location,
    prev: Location,
    load?: true,
    backNext?: true,
  },
}

export type Action = {
  type: string,
  payload: Payload,
  meta: Meta,
}

export type PlainAction = {
  type: string,
  payload: Payload,
  meta?: Meta, // eslint-disable-line flowtype/no-weak-types
}

export type Listener = ({ pathname: string }) => void
export type Listen = (Listener) => void
export type Push = ({ pathname: string }) => void
export type GoBack = () => void

export type History = {
  listen: Listen,
  push: Push,
  goBack: GoBack,
  location: {
    pathname: string,
  },
}

export type HistoryLocation = {
  pathname: string,
}

export type Document = Object // eslint-disable-line flowtype/no-weak-types
