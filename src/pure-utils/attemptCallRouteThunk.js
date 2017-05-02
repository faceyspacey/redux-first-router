// @flow
import { updateScroll } from '../connectRoutes'
import type {
  Dispatch,
  GetState,
  RouteObject,
  LocationState
} from '../flow-types'

export default (dispatch: Dispatch, getState: GetState, route: RouteObject) => {
  if (typeof window !== 'undefined') {
    const thunk = route.thunk

    if (typeof thunk === 'function') {
      const { load, hasSSR }: LocationState = getState().location

      // call thunks always if it's not initial load of the app or only if it's load
      // without SSR setup yet, so app state is setup on client when prototyping,
      // such as with with webpack-dev-server before server infrastructure is built
      if (!load || (load && !hasSSR)) {
        const prom = thunk(dispatch, getState)

        if (prom && typeof prom.next === 'function') {
          prom.next(updateScroll)
        }
      }
    }
  }
}
