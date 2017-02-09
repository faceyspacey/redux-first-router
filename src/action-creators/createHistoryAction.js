// @flow
import type { Routes, RouteNames, Location, Action } from '../flow-types'
import pathToAction from '../pure-utils/pathToAction'
import nestAction from '../pure-utils/nestAction'


export default (
  pathname: string,
  routes: Routes,
  routeNames: RouteNames,
  prevLocation: Location,
  kind: string,
): Action => {
  const action = pathToAction(pathname, routes, routeNames)
  return nestAction(pathname, action, prevLocation, kind)
}
