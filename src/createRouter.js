// @flow
import type { RoutesMapInput, Options, Store, Dispatch } from './flow-types'

import { ERROR, UPDATE_HISTORY } from './index'
import composePromise from './composePromise'
import createSmartHistory from './smart-history'
import createLocationReducer from './createLocationReducer'

import {
  createSelector,
  createDispatch,
  formatRoutes,
  shouldTransition as shouldTrans
} from './utils'

import {
  serverRedirect,
  addRoutes,
  pathlessThunk,
  anonymousThunk,
  createRouteAction,
  call,
  enter,
  changePageTitle
} from './middleware'


export default (
  routesInput: RoutesMapInput = {},
  options: Options = {},
  middlewares: Array<Function> = [
    serverRedirect,     // short-circuiting middleware
    addRoutes,
    pathlessThunk,
    anonymousThunk,
    createRouteAction,  // pipeline starts here
    call('beforeLeave', { prev: true }),
    call('beforeEnter'),
    enter,
    changePageTitle,
    call('onLeave', { prev: true }),
    call('onEnter'),
    call('thunk'),
    call('onComplete')
  ]
) => {
  const {
    location,
    title,
    createHistory = createSmartHistory,
    createReducer = createLocationReducer,
    shouldTransition = shouldTrans
  } = options

  options.shouldTransition = shouldTransition

  const routes = formatRoutes(routesInput)
  const selectLocationState = createSelector('location', location)
  const selectTitleState = createSelector('title', title)
  const history = createHistory(options)
  const reducer = createReducer(routes, history)

  const middleware = (store: Store) => {
    const getTitle = () => selectTitleState(store.getState() || {})
    const getLocation = (s) => selectLocationState(s || store.getState() || {})
    const ctx = {}
    const api = { store, history, routes, options, getLocation, ctx }
    const nextPromise = composePromise(middlewares, api, true)
    const shouldTransition = options.shouldTransition
    const onError = call('onError')(api)
    const noOp = function() {}
    let tmp = {}

    history.listen(store.dispatch)
    store.getState.rudy = api // make rudy available via `context` (see <Link />)

    return (next: Dispatch) => (action: Object) => {
      if (!shouldTransition(action, api)) return next(action)

      const req = {
        ...options.extra,
        ...api,
        tmp,
        getTitle,
        action,
        initialState: store.getState(),
        initialLocation: getLocation(),
        getState: store.getState,
        dispatch: createDispatch(() => req),
        prevRoute: routes[getLocation().type],
        route: routes[action.type] || {},
        commitHistory: action.type === UPDATE_HISTORY ? action.commit : noOp,
        commitDispatch: next,
        completed: false,
        error: null
      }

      tmp.startAction = tmp.startAction || action // stays consistent across redirects (see utils/createDispatch.js)

      return nextPromise(req) // start middleware pipeline
        .catch(error => {
          req.error = error
          req.errorType = req.route ? `${req.action.type}_ERROR` : ERROR
          // console.log('ERROR!!', error.stack.replace(new RegExp('/Users/jamesgillmore/.vscode/extensions/WallabyJs.wallaby-vscode-1.0.64/projects/2c9e7f1cfb906e5d/instrumented', 'g'), ''))
          return onError(req)
        })
        .then(res => {
          tmp = {}
          req.completed = true
          return res
        })
    }
  }

  return {
    middleware,
    reducer,
    history,
    firstRoute: () => history.firstRoute
  }
}

