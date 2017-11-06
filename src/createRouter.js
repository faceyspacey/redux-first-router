// @flow
import type { StoreEnhancer } from 'redux'
import { compose } from 'redux'

import isLocationAction from './pure-utils/isLocationAction'
import isServer from './pure-utils/isServer'
import isRedirect from './pure-utils/isRedirect'
import createSelector from './pure-utils/createSelector'
import formatRoutesMap from './pure-utils/formatRoutesMap'

import redirect from './action-creators/redirect'

import createLocationReducer from './reducer/createLocationReducer'

import createSmartHistory from './smart-history'
import composePromise from './composePromise'

import { ADD_ROUTES } from './index'

import createRouteAction from './middleware/createRouteAction'
import enter from './middleware/enter'
import call from './middleware/call'
import changePageTitle from './middleware/changePageTitle'

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
  mws: Array<Function>
) => {
  const middlewares = mws || [
    createRouteAction,
    call('beforeLeave', { prev: true }),
    call('beforeEnter'),
    enter,
    changePageTitle,
    call('onLeave', { prev: true }),
    call('onEnter'),
    call('thunk'),
    call('onComplete')
  ]

  let routesMap: RoutesMap = formatRoutesMap(routesMapInput)
  const { location, title, initialEntries }: Options = options

  const selectLocationState = createSelector('location', location)
  const selectTitleState = createSelector('title', title)

  const createHistory = options.createHistory || createSmartHistory
  const history = createHistory({ basename: options.basename, initialEntries })

  const createReducer = options.createReducer || createLocationReducer
  const reducer = createReducer(routesMapInput, history)

  const applyMiddleware = (...middlewares) => store => {
    // const store = createStore(...args)
    const { dispatch, getState } = store
    const getLocationState = () => selectLocationState(getState() || {})
    const getTitle = () => selectTitleState(getState() || {})

    const next = composePromise(...middlewares)
    let temp = {}

    const routeDispatch = (action: Object) => {
      const route = routesMap[action.type]

      if (isServer() && isRedirect(action)) return action

      if (action.type === ADD_ROUTES) {
        routesMap = { ...routesMap, ...formatRoutesMap(action.payload.routes) }
        return dispatch(action)
      }

      if (route && !route.path && typeof route.thunk === 'function') {
        const thunk = route.thunk
        const nextAction = dispatch(action)
        const bag = { action: nextAction, ...options.extra }

        return thunk(dispatch, getState, bag) || nextAction
      }

      const prevRoute = routesMap[getLocationState().type]
      const handled = isLocationAction(action) || !route || action.error
      const fromHistory = !!action.nextHistory

      if (handled && !fromHistory) return dispatch(action)

      // temp.committed = temp.committed || (action.nextHistory && action.nextHistory.kind === 'init')
      let completed = false

      const req = {
        history,
        prevRoute,
        route,
        getState,
        routesMap,
        options,
        getLocationState,
        getTitle,
        temp,
        ...options.extra,
        ...(action.nextHistory && action),
        action: !action.nextHistory ? action : undefined,
        routeDispatch,
        dispatch: action => {
          const route = routesMap[action.type]
          const isRedirect = typeof route === 'object' && route.path

          if (isRedirect && !completed) {
            action = redirect(action)
            req.temp.prev = req.action
            return req.redirect = routeDispatch(action)
          }
          else if (completed) {
            delete action.meta.location
          }

          return routeDispatch(action)
        }
      }

      return next(req)
        .catch(error => {
          console.log('ERROR!', error.stack.replace(new RegExp('/Users/jamesgillmore/.vscode/extensions/WallabyJs.wallaby-vscode-1.0.64/projects/2c9e7f1cfb906e5d/instrumented', 'g'), ''))
          req.error = error
          return call('onError')(req)
        })
        .then(res => {
          temp = {}
          completed = true
          return res
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

    // const router = applyMiddleware(...middlewares)
    // const enhancers = enhancer ? compose(router, enhancer) : router
    let store = createStore(reducer, preloadedState)
    store = applyMiddleware(...middlewares)(store)

    const state = store.getState()
    const locationState = state && selectLocationState(state)

    if (!locationState || locationState.pathname === undefined) {
      throw new Error('[rudy] your location reducer is not setup.')
    }

    history.listen(store.dispatch)

    return store
  }

  return {
    enhancer,
    reducer,
    history,
    firstRoute: () => history.initialBag
  }
}




// console.log('DISPATCH', 'handled:', (isLocationAction(action) || !route) && !action.nextHistory, action.nextHistory && 'nextHistory' || (action.type && action.type))
