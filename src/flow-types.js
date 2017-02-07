// @flow

type RouteObject = {
  path: string,
  capitalizedWords?: boolean,
  toPath?: (param: string) => string,
  fromPath?: (path: string) => string,
}

export type Route = string | RouteObject

export type Routes = {
  [key: string]: Route,
}

export type RouteValues = Array<Route>
export type RouteNames = Array<string>

export type Payload = Object // eslint-disable-line flowtype/no-weak-types

export type LocationState = {
  pathname: string,
  type: string,
  payload: Payload,
  prev: Location,
  load?: true,
  backNext?: true,
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
    bacNext?: true,
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
}
