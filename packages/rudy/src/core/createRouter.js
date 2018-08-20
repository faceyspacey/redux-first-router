// @flow
import qs from 'qs'
import type {
  Options,
  Store,
  Dispatch,
  RoutesInput,
  RequestAPI,
} from '../flow-types'
import {
  compose,
  createHistory,
  createReducer,
  createInitialState,
  createRequest,
} from './index'

import {
  createSelector,
  formatRoutes,
  shouldTransition,
  parseSearch,
  onError as defaultOnError,
} from '../utils'

import {
  serverRedirect,
  pathlessRoute,
  anonymousThunk,
  transformAction,
  call,
  enter,
  changePageTitle,
} from '../middleware'

export default (
  routesInput: RoutesInput = {},
  options: Options = {},
  middlewares: Array<Function> = [
    serverRedirect, // short-circuiting middleware
    anonymousThunk,
    pathlessRoute('thunk'),
    transformAction, // pipeline starts here
    call('beforeLeave', { prev: true }),
    call('beforeEnter'),
    enter,
    changePageTitle,
    call('onLeave', { prev: true }),
    call('onEnter'),
    call('thunk', { cache: true }),
    call('onComplete'),
  ],
) => {
  const {
    location,
    title,
    formatRoute,
    createHistory: createSmartHistory = createHistory,
    createReducer: createLocationReducer = createReducer,
    createInitialState: createState = createInitialState,
    onError: onErr,
  } = options

  // assign to options so middleware can override them in 1st pass if necessary
  options.shouldTransition = options.shouldTransition || shouldTransition
  options.createRequest = options.createRequest || createRequest
  options.compose = options.compose || compose
  options.onError = typeof onErr !== 'undefined' ? onErr : defaultOnError
  options.parseSearch = options.parseSearch || parseSearch
  options.stringifyQuery = options.stringifyQuery || qs.stringify

  const routes = formatRoutes(routesInput, formatRoute)
  const selectLocationState = createSelector('location', location)
  const selectTitleState = createSelector('title', title)
  const history = createSmartHistory(routes, options)
  const { firstAction } = history
  const initialState = createState(firstAction)
  const reducer = createLocationReducer(initialState, routes)
  const wares = {}
  const register = (name: string, val?: any = true) => (wares[name] = val)
  const has = (name: string) => wares[name]
  const ctx = { busy: false }
  const api = { routes, history, options, register, has, ctx }
  const onError = call('onError')(api)
  const nextPromise = options.compose(
    middlewares,
    api,
    true,
  )

  const middleware = ({ dispatch, getState }: Store) => {
    const getTitle = () => selectTitleState(getState() || {})
    const getLocation = (s) => selectLocationState(s || getState() || {})
    const { shouldTransition, createRequest } = options // middlewares may mutably monkey-patch these in above call to `compose`

    // TODO: Fix these annotations
    Object.assign(api, { getTitle, getLocation, dispatch, getState })

    getState.rudy = api // make rudy available via `context` with no extra Providers, (see <Link />)
    history.listen(dispatch, getLocation) // dispatch actions in response to pops, use redux location state as single source of truth

    return (dispatch: Dispatch) => (action: Object): Promise<any> => {
      if (!shouldTransition(action, api)) return dispatch(action) // short-circuit and pass through Redux middleware normally
      if (action.tmp && action.tmp.canceled) return Promise.resolve(action)

      const req = createRequest(action, api, dispatch) // the `Request` arg passed to all middleware
      const mw = req.route.middleware
      const next = mw
        ? options.compose(
            mw,
            api,
            !!req.route.path,
          )
        : nextPromise

      return next(req) // start middleware pipeline
        .catch((error) => {
          if (options.wallabyErrors) throw error // wallaby UI is linkable if we don't re-throw errors (we'll see errors for the few tests of errors outside of wallaby)
          req.error = error
          req.errorType = `${req.action.type}_ERROR`
          return onError(req)
        })
        .then((res) => {
          const { route, tmp, ctx, clientLoadBusy } = req
          const isRoutePipeline = route.path && !tmp.canceled && !clientLoadBusy
          ctx.busy = isRoutePipeline ? false : ctx.busy
          return res
        })
    }
  }

  return {
    ...api,
    middleware,
    reducer,
    firstRoute: (resolveOnEnter = true) => {
      api.resolveFirstRouteOnEnter = resolveOnEnter
      return firstAction
    },
  }
}
