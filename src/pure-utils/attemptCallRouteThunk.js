// @flow
import { updateScroll } from '../connectRoutes'
import type {
  Dispatch,
  GetState,
  RouteObject,
  LocationState,
  SelectLocationState,
  Bag
} from '../flow-types'

export default (
  dispatch: Dispatch,
  getState: GetState,
  route: RouteObject,
  selectLocationState: SelectLocationState,
  bag: Bag
) => {
  if (typeof window !== 'undefined') {
    const thunk = route.thunk

    if (typeof thunk === 'function') {
      const { kind, hasSSR }: LocationState = selectLocationState(getState())

      // call thunks always if it's not initial load of the app or only if it's load
      // without SSR setup yet, so app state is setup on client when prototyping,
      // such as with with webpack-dev-server before server infrastructure is built.
      // NEW: if there is no path, it's assumed to be a pathless route, which is always called.
      if (kind !== 'load' || (kind === 'load' && !hasSSR) || !route.path) {
        const prom = thunk(dispatch, getState, bag)

        if (prom && typeof prom.next === 'function') {
          prom.next(updateScroll)
        }
      }
    }
  }
}
