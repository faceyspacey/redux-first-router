// @flow
import type { RoutesMapInput, Options, Store, Dispatch } from '../flow-types'

import composePromise from './composePromise'
import createLocationReducer from './createLocationReducer'
import createSmartHistory from '../history'

import {
  createSelector,
  formatRoutes,
  shouldTransition,
  createRequest
} from '../utils'

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

import { onError as defaultOnError } from '../middleware/call/utils'

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
    call('thunk', { cache: true }),
    call('onComplete')
  ]
) => {
  const {
    location,
    title,
    formatRoute,
    createHistory = createSmartHistory,
    createReducer = createLocationReducer,
    compose = composePromise,
    onError
  } = options

  options.shouldTransition = options.shouldTransition || shouldTransition
  options.createRequest = options.createRequest || createRequest
  options.onError = typeof onError !== 'undefined' ? onError : defaultOnError

  const routes = formatRoutes(routesInput, formatRoute)
  const selectLocationState = createSelector('location', location)
  const selectTitleState = createSelector('title', title)
  const history = createHistory(options)
  const reducer = createReducer(routes, history.firstRoute.nextHistory, options)
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

