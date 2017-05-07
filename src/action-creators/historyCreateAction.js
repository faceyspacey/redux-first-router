// @flow
import type { RoutesMap, Location, Action, History } from '../flow-types'
import pathToAction from '../pure-utils/pathToAction'
import nestAction from '../pure-utils/nestAction'

export default (
  pathname: string,
  routesMap: RoutesMap,
  prevLocation: Location,
  history: History,
  kind: string
): Action => {
  const action = pathToAction(pathname, routesMap)
  return nestAction(pathname, action, prevLocation, history, kind)
}
