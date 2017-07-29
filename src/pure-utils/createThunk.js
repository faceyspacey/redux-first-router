// @flow
import type { Store } from 'redux'
import type { RoutesMap, SelectLocationState } from '../flow-types'

export default (
  routesMap: RoutesMap,
  selectLocationState: SelectLocationState,
  extraThunkArgument: any
) => ({ dispatch, getState }: Store<*, *>): Promise<*> => {
  const { type } = selectLocationState(getState())
  const route = routesMap[type]

  if (route && typeof route.thunk === 'function') {
    return Promise.resolve(route.thunk(dispatch, getState, extraThunkArgument))
  }

  return Promise.resolve()
}
