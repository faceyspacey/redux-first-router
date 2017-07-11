// @flow
import type { Store } from 'redux'
import type { RoutesMap, SelectLocationState } from '../flow-types'

export default (
  routesMap: RoutesMap,
  selectLocationState: SelectLocationState
) => ({ dispatch, getState }: Store<*, *>): Promise<*> => {
  const { type } = selectLocationState(getState())
  const route = routesMap[type]

  if (route && typeof route.thunk === 'function') {
    return Promise.resolve(route.thunk(dispatch, getState))
  }

  return Promise.resolve()
}
