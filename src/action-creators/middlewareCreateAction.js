// @flow
import type { RoutesMap, Location, Action } from '../flow-types'
import actionToPath from '../pure-utils/actionToPath'
import nestAction from '../pure-utils/nestAction'
import { NOT_FOUND } from '../index'


export default (
  action: Object, // eslint-disable-line flowtype/no-weak-types
  routesMap: RoutesMap,
  prevLocation: Location,
): Action => {
  try {
    const pathname = actionToPath(action, routesMap)
    return nestAction(pathname, action, prevLocation)
  }
  catch (e) {
    // developer dispatched an invalid type + payload
    // preserve previous pathname to keep app stable for future correct actions that depend on it
    const pathname = prevLocation.pathname
    const payload = { ...action.payload }
    return nestAction(pathname, { type: NOT_FOUND, payload }, prevLocation)
  }
}
