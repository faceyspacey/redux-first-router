// @flow
import type { Store } from 'redux'
import type { RoutesMap } from '../flow-types'

export default (routesMap: RoutesMap, selectLocationState: Function) => ({
  dispatch,
  getState
}: Store<*, *>): Promise<any> => {
  const { type } = selectLocationState(getState())
  const route = routesMap[type]

  if (route && typeof route.thunk === 'function') {
    return Promise.resolve(route.thunk(dispatch, getState))
  }

  return Promise.resolve()
}
