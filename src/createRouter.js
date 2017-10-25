// @flow
import type { StoreEnhancer } from 'redux'
import { compose } from 'redux'
import createSmartHistory from './smart-history'
import { stripTrailingSlash, addLeadingSlash } from './smart-history/utils/path'
import pathToAction from './pure-utils/pathToAction'
import { nestHistory } from './pure-utils/nestAction'
import isLocationAction from './pure-utils/isLocationAction'
import isServer from './pure-utils/isServer'
import isReactNative from './pure-utils/isReactNative'
import callBeforeEnter from './pure-utils/callBeforeEnter'
import callThunk from './pure-utils/callThunk'
import isRedirect from './pure-utils/isRedirect'
import performPluginWork from './pure-utils/performPluginWork'
import pathnamePlusSearch from './pure-utils/pathnamePlusSearch'
import canUseDom from './pure-utils/canUseDom'
import isClientLoadSSR from './pure-utils/isClientLoadSSR'

import callBeforeLeave, { setConfirm } from './pure-utils/callBeforeLeave'

import historyCreateAction from './action-creators/historyCreateAction'
import middlewareCreateAction from './action-creators/middlewareCreateAction'
import middlewareCreateNotFoundAction from './action-creators/middlewareCreateNotFoundAction'

import composePromise from './composePromise'

import createLocationReducer, {
  getInitialState
} from './reducer/createLocationReducer'
import { NOT_FOUND, ADD_ROUTES } from './index'

import type {
  Dispatch as Next,
  RoutesMapInput,
  RoutesMap,
  Route,
  Options,
  Action,
  ActionMetaLocation,
  ReceivedAction,
  Location,
  LocationState,
  History,
  HistoryLocation,
  Store
} from './flow-types'

const __DEV__ = process.env.NODE_ENV !== 'production'

const createAction = () => ({})

export default (
  routesMapInput: RoutesMapInput = {},
  options: Options = {},
  middlewares
) => {
  routesMapInput[NOT_FOUND] = routesMapInput[NOT_FOUND] || {}

  const routesMap: RoutesMap = Object.keys(
    routesMapInput
  ).reduce((routesMap, type) => {
    const path = routesMap[type]
    routesMap[type] = typeof path === 'string' ? { path } : path
    return routesMap
  }, routesMapInput)

  const {
    location,
    title,
    querySerializer,
    initialEntries,
    extra
  }: Options = options

  const createHistory = options.createHistory || createSmartHistory

  if (options.basename) {
    options.basename = stripTrailingSlash(addLeadingSlash(options.basename))
  }

  const history = createHistory({
    basename: options.basename,
    initialEntries
  })

  const selectLocationState =
    typeof location === 'function'
      ? location
      : location ? state => state[location] : state => state.location

  const selectTitleState =
    typeof title === 'function'
      ? title
      : title ? state => state[title] : state => state.title

  const initialPath = pathnamePlusSearch(history.location)
  const initialAction = pathToAction(initialPath, routesMap)
  const { type, payload, meta }: ReceivedAction = initialAction

  const INITIAL_STATE: LocationState = getInitialState(
    initialPath,
    meta,
    type,
    payload,
    routesMap,
    history
  )

  const locationReducer = createLocationReducer(INITIAL_STATE, routesMap)

  const applyMiddleware = (...middlewares) => createStore => (...args) => {
    const store = createStore(...args)
    const { dispatch, getState } = store

    const next = composePromise(...middlewares)
    const context = {
      temp: {},
      prev: {
        pathname: '',
        type: '',
        payload: {},
        kind: '',
        length: 1,
        index: 0
      }
    }

    const routeDispatch = (action: Object) => {
      console.log('routeDispatch', action)
      const route = routesMap[action.type]

      if (isLocationAction(action) || !route) return dispatch(action)

      const bag = {
        action,
        route,
        context,
        dispatch: action => {
          const route = routesMap[action.type]
          const isRedirect = typeof route === 'object' && route.path

          if (isRedirect) bag.stop = true

          return routeDispatch(action)
        },
        getState,
        routesMap,
        options,
        ...extra
      }

      return next(bag)
          .then(res => {
            context.temp = {}
            console.log('YES', res)
            return res
          })
          .catch(error => {
            console.log('ERROR', error)
            return error
          })
    }

    return {
      ...store,
      dispatch: routeDispatch
    }
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

    const rootReducer = (state, action) => {
      const nextState = reducer(state, action) || {}
      nextState.location = locationReducer(state && state.location, action)
      return nextState
    }

    const routerEnhancer = applyMiddleware(...middlewares)
    // const enhancers = compose(routerEnhancer, enhancer)
    const store = createStore(rootReducer, preloadedState, routerEnhancer)
    const state = store.getState()
    const locationState = state && selectLocationState(state)

    if (!locationState || !locationState.pathname) {
      throw new Error('[rudy] your location reducer is not setup.')
    }

    history.listen(store.dispatch)
    _store = store

    return store
  }

  let _store

  const firstRoute = () => _store.dispatch({ nextHistory: history })

  return {
    enhancer,
    firstRoute
  }
}
