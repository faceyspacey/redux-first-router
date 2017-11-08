// @flow
import composePromise from './composePromise'
import createSmartHistory from './smart-history'
import createLocationReducer from './createLocationReducer'

import createSelector from './utils/createSelector'
import createDispatch from './utils/createDispatch'
import formatRoutesMap from './utils/formatRoutesMap'
import shouldTrans from './utils/shouldTransition'

import serverRedirect from './middleware/serverRedirect'
import addRoutes from './middleware/addRoutes'
import pathlessThunk from './middleware/pathlessThunk'
import createRouteAction from './middleware/createRouteAction'
import call from './middleware/call'
import enter from './middleware/enter'
import changePageTitle from './middleware/changePageTitle'

import type { RoutesMapInput, Options, Store, Dispatch } from './flow-types'

export default (
  routesMapInput: RoutesMapInput = {},
  options: Options = {},
  middlewares: Array<Function> = [
    serverRedirect,
    addRoutes,
    pathlessThunk,
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
) => {
  const {
    location,
    title,
    querySerializer: serializer,
    createHistory = createSmartHistory,
    createReducer = createLocationReducer,
    shouldTransition = shouldTrans
  } = options

  const routesMap = formatRoutesMap(routesMapInput)
  const selectLocationState = createSelector('location', location)
  const selectTitleState = createSelector('title', title)
  const history = createHistory(options)
  const reducer = createReducer(routesMap, history)
  const nextPromise = composePromise(middlewares)

  const middleware = (store: Store) => {
    const getTitle = () => selectTitleState(store.getState() || {})
    const getLocationState = () => selectLocationState(store.getState() || {})

    const context = {}
    let temp = {}

    _getLocationState = getLocationState

    history.listen(store.dispatch)

    return (next: Dispatch) => (action: Object) => {
      if (!shouldTransition(action, routesMap)) return next(action)

      const req = {
        ...options.extra,
        history,
        routesMap,
        options,
        getLocationState,
        getTitle,
        context,
        temp,
        store,
        getState: store.getState,
        dispatch: createDispatch(() => req),
        route: routesMap[action.type],
        prevRoute: routesMap[getLocationState().type],
        action: !action.nextHistory ? action : null,
        nextHistory: action.nextHistory || null,
        commitHistory: action.commit || null,
        commitDispatch: next,
        completed: false
      }

      return nextPromise(req)
        .catch(error => {
          req.error = error
          return call('onError')(req)
        })
        .then(res => {
          temp = {}
          req.completed = true
          return res
        })
    }
  }

  _options = options
  _history = history

  return {
    middleware,
    reducer,
    history,
    firstRoute: () => history.firstRoute
  }
}

let _options
let _history
let _getLocationState

export const getOptions = (): Options => _options || {}
export const history = () => _history
export const getLocationState = () => _getLocationState()
