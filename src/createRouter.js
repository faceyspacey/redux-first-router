// @flow
import type { StoreEnhancer } from 'redux'

import isLocationAction from './pure-utils/isLocationAction'
import isServer from './pure-utils/isServer'
import createSelector from './pure-utils/createSelector'
import formatRoutesMap from './pure-utils/formatRoutesMap'

import createLocationReducer, { getInitialState } from './reducer/createLocationReducer'

import createSmartHistory from './smart-history'
import composePromise from './composePromise'

import type {
  Dispatch as Next,
  RoutesMapInput,
  RoutesMap,
  Options,
  Store
} from './flow-types'

export default (
  routesMapInput: RoutesMapInput = {},
  options: Options = {},
  middlewares: Array<Function>
) => {
  const routesMap: RoutesMap = formatRoutesMap(routesMapInput)
  const { location, title, initialEntries }: Options = options

  const selectLocationState = createSelector('location', location)
  const selectTitleState = createSelector('title', title)

  const createHistory = options.createHistory || createSmartHistory
  const history = createHistory({ basename: options.basename, initialEntries })

  const INITIAL_STATE = getInitialState(history.url, routesMap, history)
  const reducer = createLocationReducer(INITIAL_STATE, routesMap)

  const applyMiddleware = (...middlewares) => createStore => (...args) => {
    const store = createStore(...args)
    const { dispatch, getState } = store
    const getLocationState = () => selectLocationState(getState() || {})

    const next = composePromise(...middlewares)

    const routeDispatch = (action: Object) => {
      const route = routesMap[action.type]

      console.log('DISPATCH', 'handled:', (isLocationAction(action) || !route) && !action.nextHistory, action.nextHistory && 'nextHistory' || (action.type && action.type))
      if ((isLocationAction(action) || !route) && !action.nextHistory) return dispatch(action)

      const req = {
        history,
        route,
        getState,
        routesMap,
        options,
        getLocationState,
        ...options.extra,
        ...(action.nextHistory && action),
        action: !action.nextHistory ? action : undefined,
        dispatch: action => {
          const route = routesMap[action.type]
          const isRedirect = typeof route === 'object' && route.path

          if (isRedirect) bag.stop = true

          return routeDispatch(action)
        }
      }

      return next(req)
        .catch(error => {
          console.log('ERROR!!!', error)
          return error
        })
    }

    return { ...store, dispatch: routeDispatch }
  }

  const enhancer: StoreEnhancer<*, *> = createStore => (
    reducer,
    preloadedState,
    enhancer
  ): Store => {
    // insure routesMap is transferred from server to client (it cant be stringified during SSR)
    if (!isServer() && preloadedState && selectLocationState(preloadedState)) {
      selectLocationState(preloadedState).routesMap = routesMap
    }

    const routerEnhancer = applyMiddleware(...middlewares)
    // const enhancers = compose(routerEnhancer, enhancer)
    const store = createStore(reducer, preloadedState, routerEnhancer)
    const state = store.getState()
    const locationState = state && selectLocationState(state)

    if (!locationState || !locationState.pathname) {
      throw new Error('[rudy] your location reducer is not setup.')
    }

    history.listen(store.dispatch)

    return store
  }

  return {
    enhancer,
    reducer,
    history,
    firstRoute: () => ({ nextHistory: history, commit() {} })
  }
}
