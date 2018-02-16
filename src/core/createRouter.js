// @flow
import type { RoutesMapInput, Options, Store, Dispatch } from '../flow-types'

import createSmartHistory from '../history'
import { composePromise, createLocationReducer, createRequest } from './index'

import {
  createSelector,
  formatRoutes,
  shouldTransition
} from '../utils'

import {
  serverRedirect,
  pathlessRouteThunk,
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
    pathlessRouteThunk,
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
    onError
  } = options

  // assign to options so middleware can override them in 1st pass if necessary
  options.shouldTransition = options.shouldTransition || shouldTransition
  options.createRequest = options.createRequest || createRequest
  options.compose = options.compose || composePromise
  options.onError = typeof onError !== 'undefined' ? onError : defaultOnError

  const routes = formatRoutes(routesInput, formatRoute)
  const selectLocationState = createSelector('location', location)
  const selectTitleState = createSelector('title', title)
  const history = createHistory(options)
  const reducer = createReducer(routes, history.firstRoute.nextHistory, options)
  const availableMiddlewares = {}
  const registerMiddleware = (name: string) => availableMiddlewares[name] = true
  const hasMiddleware = (name: string) => availableMiddlewares[name]
  const api = { routes, history, options, registerMiddleware, hasMiddleware }

  const middleware = (store: Store) => {
    const getTitle = () => selectTitleState(store.getState() || {})
    const getLocation = (s) => selectLocationState(s || store.getState() || {})
    const ctx = { busy: false }

    Object.assign(api, { store, getTitle, getLocation, ctx })

    let nextPromise = typeof middlewares === 'function'
      ? middlewares(api, true)
      : options.compose(middlewares, api, true)

    const { shouldTransition, createRequest } = options
    const onError = call('onError')(api)

    history.listen(store.dispatch)
    store.getState.rudy = api // make rudy available via `context` (see <Link />)

    return (next: Dispatch) => (action: Object) => {
      if (!shouldTransition(action, api)) return next(action)

      const req = createRequest(action, api, next)

      nextPromise = req.route.middleware
        ? typeof req.route.middleware === 'function'
          ? req.route.middleware(api, true)
          : options.compose(req.route.middleware, api, true)
        : nextPromise

      return nextPromise(req) // start middleware pipeline
        .catch(error => {
          req.error = error
          req.errorType = `${req.action.type}_ERROR`
          return onError(req)
        })
        .then(res => {
          const isRouteChangingPipeline = req.route.path && !req.clientLoadBusy
          req.ctx.busy = isRouteChangingPipeline ? false : req.ctx.busy
          return res
        })
    }
  }

  return {
    firstRoute: (awaitWholePipeline) => {
      if (awaitWholePipeline) {
        api.awaitWholePipeline = awaitWholePipeline
      }

      return history.firstRoute
    },
    middleware,
    reducer,
    rudy: api
  }
}

