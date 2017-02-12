// @flow
import type { Store } from 'redux'
import type { RoutesMap } from '../flow-types'


export default (
  routesMap: RoutesMap,
  locationKey: string,
) => (
  { dispatch, getState }: Store<*, *>,
): Promise<any> => { // eslint-disable-line flowtype/no-weak-types
  const { type } = getState()[locationKey]
  const route = routesMap[type]

  if (route && typeof route.thunk === 'function') {
    return Promise.resolve(route.thunk(dispatch, getState))
  }

  return Promise.resolve()
}
