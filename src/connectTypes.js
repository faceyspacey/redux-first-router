import actionToPath from './pure-utils/actionToPath'
import pathToAction from './pure-utils/pathToAction'
import nestAction from './pure-utils/nestAction'
import isLocationAction from './pure-utils/isLocationAction'
import objectValues from './pure-utils/objectValues'

import { NOT_FOUND } from './actions'


/** PRIMARY EXPORT: `connectTypes(routes: object, history: history, options: object)`
 *  `connectTypes` returns: `{reducer, middleware, enhancer}`
 *
 *  Internally it is powered by listening of location-aware dispatches
 *  through the middleware as well as through listening to `window.location` history changes
 *
 *  note: if you're wondering, the following function when called returns functions
 *  in a closure that provide access to variables in a private
 *  "per instance" fashion in order to be used in SSR without leaking
 *  state between SSR requests :).
*/

export default function connectTypes(routes = {}, history, options = {}) {
  if (process.env.NODE_ENV !== 'production') {
    if (!history) {
      throw new Error(`
        [pure-redux-rouer] invalid \`history\` agument. Using the 'history' package on NPM,
        please provide a \`history\` object as a second parameter. The object will be the
        return of createBrowserHistory() (or in React Native or Node: createMemoryHistory()).
        See: https://github.com/mjackson/history`,
      )
    }
  }


  /** INTERNAL ENCLOSED STATE (PER INSTANCE FOR SSR!) */

  let currentPathname = history.location.pathname             // very important: used for comparison to determine address bar changes

  const HISTORY = history                                     // history object created via createBrowserHistory or createMemoryHistory (using history package) passed to connectTypes(routesDict, history)
  const ROUTES_DICT = routes                                  // {HOME: '/home', INFO: '/info/:param'} -- our route "constants" defined by our user (typically in configureStore.js)
  const ROUTE_NAMES = Object.keys(ROUTES_DICT)                // ['HOME', 'INFO', 'ETC']
  const ROUTES = objectValues(ROUTES_DICT)                    // ['/home', '/info/:param/', '/etc/:etc']

  const { type, payload } = pathToAction(currentPathname, ROUTES, ROUTE_NAMES)

  const INITIAL_LOCATION_STATE = {
    pathname: currentPathname,
    type,
    payload,
    prev: {
      pathname: null,
      type: null,
      payload: null,
    },
  }

  const {
    onBackNext,
    location: locationKey = 'location',
    title: titleKey,
  } = options


  /** LOCATION REDUCER: */

  function locationReducer(state = INITIAL_LOCATION_STATE, action) {
    if (ROUTES_DICT[action.type] || action.type === NOT_FOUND) {
      state = {
        pathname: action.meta.location.current.pathname,
        type: action.type,
        payload: action.payload || {},
        prev: action.meta.location.prev || state.prev,
      }

      if (action.meta.location.load) {
        state.load = true
      }

      if (action.meta.location.backNext) {
        state.backNext = true
      }
    }

    return state
  }


  /** MIDDLEWARE */

  function middleware(store) {
    return next => (action) => {
      if (action.error && isLocationAction(action)) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('pure-redux-router: location update did not dispatch as your action has an error.')
        }
      }

      // user decided to dispatch `NOT_FOUND`, so we fill in the missing location info
      else if (action.type === NOT_FOUND && !isLocationAction(action)) {
        const { pathname } = store.getState().location
        action = _prepareAction(pathname, { type: NOT_FOUND, payload: action.payload || {} })
      }

      // dispatched action matches a connected type and is not already handled by `handleHistoryChanges`
      else if (ROUTES_DICT[action.type] && !isLocationAction(action)) {
        action = createMiddlewareAction(action, ROUTES_DICT, store.getState().location)
      }

      const nextAction = next(action)
      const nextState = store.getState()

      changeAddressBar(nextState)

      return nextAction
    }
  }


  /** ENHANCER */

  function enhancer(createStore) {
    return (reducer, preloadedState, enhancer) => {
      const store = createStore(reducer, preloadedState, enhancer)

      const state = store.getState()
      const location = state[locationKey]

      if (!location || !location.pathname) {
        throw new Error(`[pure-redux-router] you must provide the key of the location
          reducer state and properly assigned the location reducer to that key.`)
      }

      const dispatch = store.dispatch.bind(store)
      HISTORY.listen(handleHistoryChanges.bind(null, dispatch))

      const firstAction = createHistoryAction(currentPathname, 'load')
      store.dispatch(firstAction)

      return store
    }
  }


  /** ADDRESS BAR + BROWSER BACK/NEXT HANDLING */

  function handleHistoryChanges(dispatch, location) {
    // insure middleware hasn't already handled location change
    if (location.pathname !== currentPathname) {
      if (typeof onBackNext === 'function') {
        onBackNext(location)
      }

      currentPathname = location.pathname

      const action = createHistoryAction(currentPathname)
      dispatch(action) // dispatch route type + payload as it changes via back/next buttons usage
    }
  }

  function changeAddressBar(nextState) {
    const location = nextState[locationKey]

    if (location.pathname !== currentPathname) {
      currentPathname = location.pathname
      HISTORY.push({ pathname: currentPathname })
    }

    // needs to be called even if pathname does not change since handleHistoryChanges will have
    // already set the pathname, but not the title since it didn't have access to nextState[titleKey]
    changePageTitle(nextState[titleKey])
  }

  function changePageTitle(title) {
    if (typeof window !== 'undefined' && typeof title === 'string') {
      document.title = title
    }
  }


  /** ACTION CREATORS: */

  function createMiddlewareAction(action, routesDict, location) {
    try {
      const pathname = actionToPath(action, routesDict)
      return _prepareAction(pathname, action)
    }
    catch (e) {
      // developer dispatched an invalid type + payload
      // preserve previous pathname to keep app stable for future correct actions that depend on it
      const pathname = (location && location.pathname) || null
      const payload = action.payload || {}
      return _prepareAction(pathname, { type: NOT_FOUND, payload })
    }
  }

  function createHistoryAction(pathname, kind = 'backNext', routes = ROUTES, routeNames = ROUTE_NAMES) {
    let action = pathToAction(pathname, routes, routeNames)
    action = _prepareAction(pathname, action)
    action.meta.location[kind] = true
    return action
  }


  /* INTERNAL UTILITY FUNCTIONS (THEY RELY ON OUR ENCLOSED STATE) **/

  let prev = null

  function _prepareAction(pathname, receivedAction) {
    const action = nestAction(pathname, receivedAction, prev)
    prev = { ...action.meta.location.current }
    return action
  }

  _exportedGo = (pathname, routes = ROUTES, routeNames = ROUTE_NAMES) =>
    pathToAction(pathname, routes, routeNames) // only pathname arg expected in client code


  //* * OUR GLORIOUS RETURN TRIUMVIRATE: reducer, middleware and enhancer */

  return {
    reducer: locationReducer,
    middleware,
    enhancer,
  }
}

/** SIDE EFFECT:
 *  Client code needs a simple go to path function. `exportedGo` gets replaced with a function aware of private instance variables.
 *  NOTE: it's also used by https://github.com/celebvidy/pure-redux-router-link 's `<Link /> component.
 *  NOTE: it will not harm SSR (unless you simulate clicking links server side--and dont do that, dispatch actions instead).
*/

let _exportedGo

export const go = (pathname: string) =>
  _exportedGo(pathname)
