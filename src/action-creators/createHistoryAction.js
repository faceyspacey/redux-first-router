// @flow
import type { RoutesMap, Location, Action } from '../flow-types'
import pathToAction from '../pure-utils/pathToAction'
import nestAction from '../pure-utils/nestAction'


export default (
  pathname: string,
  routesMap: RoutesMap,
  prevLocation: Location,
  kind: string,
): Action => {
  const action = pathToAction(pathname, routesMap)
  return nestAction(pathname, action, prevLocation, kind)
}
