// @flow
import type { Store, Middleware, StoreEnhancer } from 'redux'

import pathToAction from './pure-utils/pathToAction'
import nestAction from './pure-utils/nestAction'
import isLocationAction from './pure-utils/isLocationAction'
import isServer from './pure-utils/isServer'
import changePageTitle, { getDocument } from './pure-utils/changePageTitle'
import attemptCallRouteThunk from './pure-utils/attemptCallRouteThunk'
import createThunk from './pure-utils/createThunk'

import historyCreateAction from './action-creators/historyCreateAction'
import middlewareCreateAction from './action-creators/middlewareCreateAction'

import createLocationReducer, { getInitialState } from './reducer/createLocationReducer'
import { NOT_FOUND } from './index'

import type {
  Dispatch,
  RoutesMap,
  Options,
  ReceivedAction,
  Location,
  LocationState,
  History,
  HistoryLocation,
  Document,
} from './flow-types'


/** PRIMARY EXPORT - `connectRoutes(history, routeMap, options)`:
 *
 *  PURPOSE: to provide set-it-forget-it syncing of actions to the address bar and vice
 *  versa, using the pairing of action types to express-style routePaths bi-directionally.
 *
 *  EXAMPLE:
 *  with routeMap `{ FOO: '/foo/:paramName' }`,
 *
 *  pathname '/foo/bar' would become:
 *  `{ type: 'FOO', payload: { paramName: 'bar' } }`
 *
 *  AND
 *
 *  action `{ type: 'FOO', payload: { paramName: 'bar' } }`
 *  becomes: pathname '/foo/bar'
 *
 *
 *  HOW: Firstly, the middleware listens to received actions and then converts them to the
 *  pathnames it applies to the address bar (via `history.push({ pathname })`. It also formats
 *  the action to be location-aware, primarily by including a matching pathname, which the
 *  location reducer listens to, and which user reducers can also make use of.
 *
 *  However, user reducers typically only need to  be concerned with the type
 *  and payload like they are accustomed to. That's the whole purpose of this package.
 *  The idea is by matching action types to routePaths, it's set it and forget it!
 *
 *  Secondly, a history listener listens to URL changes and dispatches actions with
 *  types and payloads that match the pathname. Hurray! Browse back/next buttons now work!
 *
 *  Both the history listener and middleware are made to not get into each other's way, i.e.
 *  avoiding double dispatching and double address bar changes.
 *
 *
 *  VERY IMPORTANT NOTE ON SSR: if you're wondering, `connectRoutes()` when called returns
 *  functions in a closure that provide access to variables in a private
 *  "per instance" fashion in order to be used in SSR without leaking
 *  state between SSR requests :).
 *
 *  As much as possible has been refactored out of this file into pure or
 *  near-pure utility functions.
*/

export default (
  history: History,
  routesMap: RoutesMap = {},
  options: Options = {},
) => {
  if (process.env.NODE_ENV !== 'production' && !history) {
    throw new Error(`
      [pure-redux-router] invalid \`history\` agument. Using the 'history' package on NPM,
      please provide a \`history\` object as a second parameter. The object will be the
      return of createBrowserHistory() (or in React Native or Node: createMemoryHistory()).
      See: https://github.com/mjackson/history`,
    )
  }


  /** INTERNAL ENCLOSED STATE (PER INSTANCE FOR SSR!) */
  let currentPathname: string = history.location.pathname     // very important: used for comparison to determine address bar changes
  let prevLocation: Location = {                              // maintains previous location state in location reducer
    pathname: '',
    type: '',
    payload: {},
  }

  const {
    onBackNext,
    location: locationKey = 'location',
    title: titleKey = 'title',
  }: Options = options

  const { type, payload }: ReceivedAction = pathToAction(currentPathname, routesMap)
  const INITIAL_LOCATION_STATE: LocationState = getInitialState(currentPathname, type, payload, routesMap)

  const reducer = createLocationReducer(INITIAL_LOCATION_STATE, routesMap)
  const thunk = createThunk(routesMap, locationKey)

  const windowDocument: Document = getDocument()              // get plain object for window.document if server side


  /** MIDDLEWARE
   *  1)  dispatches actions with location info in the `meta` key by matching the received action
   *      type + payload to express style routePaths (which also results in location reducer state updating)
   *  2)  changes the address bar url and page title if the currentPathName changes, while
   *      avoiding collisions with simultaneous browser history changes
  */

  const middleware: Middleware<*, *> = store => next => action => {
    const route = routesMap[action.type]

    if (action.error && isLocationAction(action)) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('pure-redux-router: location update did not dispatch as your action has an error.')
      }
    }

    // user decided to dispatch `NOT_FOUND`, so we fill in the missing location info
    else if (action.type === NOT_FOUND && !isLocationAction(action)) {
      const { pathname } = store.getState().location
      const { payload } = action

      action = nestAction(pathname, { type: NOT_FOUND, payload }, prevLocation)
      prevLocation = action.meta.location.current
    }

    // THE MAGIC: dispatched action matches a connected type, so we generate a
    // location-aware action and also as a result update location reducer state.
    else if (route && !isLocationAction(action)) {
      action = middlewareCreateAction(action, routesMap, prevLocation)
      prevLocation = action.meta.location.current
    }

    const nextAction = next(action)
    const nextState = store.getState()

    // IMPORTANT: keep currentPathname up to date for comparison to prevent double dispatches
    // between BROWSER back/forward button usage vs middleware-generated actions
    _middlewareAttemptChangeUrl(nextState[locationKey], history)
    changePageTitle(windowDocument, nextState[titleKey])

    if (typeof route === 'object') {
      const dispatch = middleware(store)(next) // re-create this function's position in the middleware chain
      attemptCallRouteThunk(dispatch, store.getState, route)
    }

    return nextAction
  }


  /** ENHANCER
   *  1)  dispatches actions with types and payload extracted from the URL pattern
   *      when the browser history changes
   *  2)  on load of the app dispatches an action corresponding to the initial url
   */

  const enhancer: StoreEnhancer<*, *> = createStore => (reducer, preloadedState, enhancer): Store<*, *> => {
    // routesMap stored in location reducer will be stringified as it goes from the server to client
    // and as a result functions in route objects will be removed--here's how we insure we bring them back
    if (typeof window !== 'undefined' && preloadedState && preloadedState[locationKey]) {
      preloadedState[locationKey].routesMap = routesMap
    }

    const store = createStore(reducer, preloadedState, enhancer)
    const state = store.getState()
    const location = state[locationKey]

    if (!location || !location.pathname) {
      throw new Error(`[pure-redux-router] you must provide the key of the location
        reducer state and properly assigned the location reducer to that key.`)
    }

    const dispatch = store.dispatch.bind(store)
    history.listen(_historyAttemptDispatchAction.bind(null, dispatch))

    // dispatch the first location-aware action so initial app state is based on the url on load
    if (!location.hasSSR || isServer()) { // only dispatch on client before SSR is setup, which passes state on to the client
      const action = historyCreateAction(currentPathname, routesMap, prevLocation, 'load')
      prevLocation = action.meta.location.current
      store.dispatch(action)
    }

    return store
  }


  /* INTERNAL UTILITY FUNCTIONS (THEY ARE IN THIS FILE BECAUSE THEY RELY ON OUR ENCLOSED STATE) **/

  const _historyAttemptDispatchAction = (dispatch: Dispatch, location: HistoryLocation) => {
    if (location.pathname !== currentPathname) {      // IMPORTANT: insure middleware hasn't already handled location change
      currentPathname = location.pathname             // IMPORTANT: must happen before dispatch (to prevent double handling)

      // THE MAGIC: parse the address bar path into a matched action
      const action = historyCreateAction(location.pathname, routesMap, prevLocation, 'backNext')
      prevLocation = action.meta.location.current
      dispatch(action)                                // dispatch route type + payload corresponding to browser back/forward usage

      if (typeof onBackNext === 'function') {
        onBackNext(action, location)
      }
    }
  }

  const _middlewareAttemptChangeUrl = (locationState: LocationState, history: History) => {
    if (locationState.pathname !== currentPathname) { // IMPORTANT: insure history hasn't already handled location change
      currentPathname = locationState.pathname        // IMPORTANT: must happen before history.push() (to prevent double handling)
      history.push({ pathname: currentPathname })     // change address bar corresponding to matched actions from middleware
    }
  }

  // solely for use by exported `go` function in client code (see below)
  _exportedGo = (pathname: string) =>
    pathToAction(pathname, routesMap) // only pathname arg expected in client code

  _history = history


  /* RETURN  */

  return {
    reducer,
    middleware,
    enhancer,
    thunk,

    // returned only for tests (not for use in application code)
    _middlewareAttemptChangeUrl,
    _historyAttemptDispatchAction,
    _exportedGo,
    windowDocument,
    history,
  }
}

/** SIDE EFFECTS:
 *  Client code needs a simple `go` to path action creator and `back` function because it's convenient for
 *  prototyping. It will not harm SSR, so long as you don't use it server side. So that means DO NOT
 *  simulate clicking links server side--and dont do that, dispatch actions to setup state instead.
 *
 *  THE IDIOMATIC WAY: instead use https://github.com/faceyspacey/pure-redux-router-link 's `<Link />`
 *  component to generate SEO friendly urls. As its `href` prop, you pass it a path, array of path
 *  segments or action, and internally it will use `connectRoutes` to change the address bar and
 *  dispatch the correct final action from middleware.
*/

let _exportedGo
let _history

export const go = (pathname: string) =>
  _exportedGo(pathname)


/** NOTE: The better way to accomplish a back button is to use your redux state to determine
 *  the previous URL. The location reducer will also contain relevant info. But if you must,
 *  this is here for convenience and it basically simulates the user pressing the browser
 *  back button, which of course the system picks up and parses into an action.
 */

export const back = () =>
  _history.goBack()
