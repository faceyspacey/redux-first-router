// @flow
import type { RoutesMapInput, Options, Store, Dispatch } from '../flow-types'

import composePromise from './composePromise'
import createLocationReducer from './createLocationReducer'
import createRequest from './createRequest'

import createSmartHistory from '../history'

import { createSelector, formatRoutesMap, shouldTransition } from '../utils'

import {
  serverRedirect,
  addRoutes,
  pathlessThunk,
  anonymousThunk,
  transformAction,
  call,
  enter,
  changePageTitle
} from '../middleware'

export default (
  routesInput: RoutesMapInput = {},
  options: Options = {},
  middlewares: Array<Function> = [
    serverRedirect,     // short-circuiting middleware
    addRoutes,
    pathlessThunk,
    anonymousThunk,
    transformAction,      // pipeline starts here
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
    formatRoutes = formatRoutesMap,
    createHistory = createSmartHistory,
    createReducer = createLocationReducer,
    compose = composePromise,
  } = options

  options.shouldTransition = options.shouldTransition || shouldTransition
  options.createRequest = options.createRequest || createRequest

  const routes = formatRoutes(routesInput)
  const selectLocationState = createSelector('location', location)
  const selectTitleState = createSelector('title', title)
  const history = createHistory(options)
  const reducer = createReducer(routes, history)
  const api = { routes, history, options }

  const middleware = (store: Store) => {
    const getTitle = () => selectTitleState(store.getState() || {})
    const getLocation = (s) => selectLocationState(s || store.getState() || {})

    Object.assign(api, { store, getTitle, getLocation })

    const nextPromise = compose(middlewares, api, true)
    const { shouldTransition, createRequest } = options
    const onError = call('onError')(api)
    let tmp = {}

    history.listen(store.dispatch)
    store.getState.rudy = api // make rudy available via `context` (see <Link />)

    return (next: Dispatch) => (action: Object) => {
      if (!shouldTransition(action, api)) return next(action)

      const req = createRequest(action, api, tmp, next)

      return nextPromise(req) // start middleware pipeline
        .catch(error => {
          req.error = error
          req.errorType = `${req.action.type}_ERROR`
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
    firstRoute: () => history.firstRoute,
    middleware,
    reducer,
    rudy: api
  }
}

