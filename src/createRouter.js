// @flow
import composePromise from './composePromise'
import createSmartHistory from './smart-history'
import createLocationReducer from './createLocationReducer'

import createSelector from './utils/createSelector'
import createDispatch from './utils/createDispatch'
import formatRoutes from './utils/formatRoutes'
import shouldTrans from './utils/shouldTransition'

import serverRedirect from './middleware/serverRedirect'
import addRoutes from './middleware/addRoutes'
import pathlessThunk from './middleware/pathlessThunk'
import plainActionRoute from './middleware/plainActionRoute'
import anonymousThunk from './middleware/anonymousThunk'
import createRouteAction from './middleware/createRouteAction'
import call from './middleware/call'
import enter from './middleware/enter'
import changePageTitle from './middleware/changePageTitle'

import type { RoutesMapInput, Options, Store, Dispatch } from './flow-types'
import { ERROR } from './index'

export default (
  routesInput: RoutesMapInput = {},
  options: Options = {},
  middlewares: Array<Function> = [
    serverRedirect,     // short-circuiting middleware
    addRoutes,
    pathlessThunk,
    plainActionRoute,
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
  const reducer = createReducer(routes, history, options)

  const middleware = (store: Store) => {
    const getTitle = () => selectTitleState(store.getState() || {})
    const locationState = () => selectLocationState(store.getState() || {})
    const ctx = {}
    const tmp = {}
    const api = { store, history, routes, options, locationState, ctx, tmp }
    const nextPromise = composePromise(middlewares, api)
    const shouldTransition = options.shouldTransition
    const onError = call('onError')(api)

    history.listen(store.dispatch)
    store.getState.rudy = api // make rudy available via `context` (see <Link />)

    return (next: Dispatch) => (action: Object) => {
      if (!shouldTransition(action, api)) return next(action)

      const req = {
        ...options.extra,
        ...api,
        getTitle,
        state: store.getState(),
        getState: store.getState,
        location: locationState(),
        dispatch: createDispatch(() => req),
        action: !action.nextHistory ? action : null,
        prevRoute: routes[locationState().type],
        route: routes[action.type],
        nextHistory: action.nextHistory || null,
        commitHistory: action.commit || null,
        commitDispatch: next,
        completed: false,
        error: null
      }

      return nextPromise(req) // start middleware pipeline
        .catch(error => {
          req.error = error
          req.errorType = req.route ? `${req.action.type}_ERROR` : ERROR
          console.log('ERROR!!', error.stack.replace(new RegExp('/Users/jamesgillmore/.vscode/extensions/WallabyJs.wallaby-vscode-1.0.64/projects/2c9e7f1cfb906e5d/instrumented', 'g'), ''))
          return onError(req)
        })
        .then(res => {
          for (const key in tmp) delete tmp[key]
          req.completed = true
          return res
        })
    }
  }

  _history = history

  return {
    middleware,
    reducer,
    history,
    firstRoute: () => history.firstRoute
  }
}

let _history
export const history = () => _history
