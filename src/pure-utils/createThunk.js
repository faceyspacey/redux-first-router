// @flow
import type { Store } from 'redux'
import type { RoutesMap, SelectLocationState, Bag } from '../flow-types'

export default (
  routesMap: RoutesMap,
  selectLocationState: SelectLocationState,
  bag: Bag
) => ({ dispatch, getState }: Store<*, *>): Promise<*> => {
  const { type } = selectLocationState(getState())
  const route = routesMap[type]

  if (route && typeof route.thunk === 'function') {
    return Promise.resolve(route.thunk(dispatch, getState, bag))
  }

  return Promise.resolve()
}
