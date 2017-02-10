// @flow
import type { Dispatch, Store, Middleware, StoreEnhancer } from 'redux'

import pathToAction from './pure-utils/pathToAction'
import nestAction from './pure-utils/nestAction'
import isLocationAction from './pure-utils/isLocationAction'
import objectValues from './pure-utils/objectValues'

import changePageTitle, { getDocument } from './dom-utils/changePageTitle'
import changeAddressBar from './dom-utils/changeAddressBar'

import createHistoryAction from './action-creators/createHistoryAction'
import createMiddlewareAction from './action-creators/createMiddlewareAction'

import createLocationReducer, { getInitialState } from './createLocationReducer'
import { NOT_FOUND } from './actions'

import type {
  RoutesMap,
  Routes,
  RouteNames,
  Options,
  PlainAction,
  Location,
  LocationState,
  History,
  HistoryLocation,
  Document,
} from './flow-types'


/** PRIMARY EXPORT - `connectTypes(history, routeMap, options)`:
 *
 *  PURPOSE: to sync actions to the address bar and vice versa,
 *  using the pairing of action types to express-style routePaths bi-directionally.
 *
 *  EXAMPLE:
 *  with routeMap `{ FOO: '/foo/:paramName' }`,
 *
 *  pathname '/foo/bar' would become:
 *  `{ type: 'FOO', payload: { paramName: 'bar' } }`
 *
 *  AND
 *
 *  `{ type: 'FOO', payload: { paramName: 'bar' } }`
 *  becomes: pathname '/foo/bar'
 *
 *
 *  HOW: Firstly, the middleware listens to received actions and then converts them to
 *  pathnames it applies to the address bar. It also formats the action to be location-aware,
 *  primarily by including a matching pathname, which the location reducer listens to, and
 *  which user reducers can also make use of.
 *
 *  However, user reducers typically only need to  be concerned with the type
 *  and payload like they are accustomed to. That's the whole purpose of this package.
 *  The idea is by matching action types to routePaths, it's set it and forget it!
 *
 *  Secondly, a history listener listens to URL changes and dispatches actions with
 *  types and payloads that match the pathname. Hurray!
 *
 *  Both the history listener and middleware are made to not get into each other's way, i.e.
 *  avoiding double dispatching and double address bar changes.
 *
 *
 *  VERY IMPORTANT NOTE ON SSR: if you're wondering, `connectTypes()` when called returns
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

  let currentPathname: string = history.location.pathname     // very important: used for comparison to determine address bar changes
  let prevLocation: Location = {                              // provides previous location state in location reducer
    pathname: '',
    type: '',
    payload: {},
  }

  const HISTORY: History = history                            // history object created via createBrowserHistory or createMemoryHistory (using history package) passed to connectTypes(routesMap, history)
  const ROUTES_MAP: RoutesMap = routesMap                     // {HOME: '/home', INFO: '/info/:param'} -- our route "constants" defined by our user (typically in configureStore.js)
  const ROUTE_NAMES: RouteNames = Object.keys(ROUTES_MAP)     // ['HOME', 'INFO', 'ETC']
  const ROUTES: Routes = objectValues(ROUTES_MAP)             // ['/home', '/info/:param/', '/etc/:etc']
  const windowDocument: Document = getDocument()              // get plain object for window.document if server side

  const {
    onBackNext,
    location: locationKey = 'location',
    title: titleKey = 'title',
  }: Options = options

  const { type, payload }: PlainAction = pathToAction(currentPathname, ROUTES, ROUTE_NAMES)
  const INITIAL_LOCATION_STATE: LocationState = getInitialState(currentPathname, type, payload)
  const reducer = createLocationReducer(INITIAL_LOCATION_STATE, ROUTES_MAP)


  /** MIDDLEWARE
   *  1)  dispatches actions with location info in the `meta` key by matching the received action
   *      type + payload to express style routePaths (which also results in location reducer state updating)
   *  2)  changes the address bar url and page title if the currentPathName changes, while
   *      avoiding collisions with simultaneous browser history changes
  */

  const middleware: Middleware<*, *> = store => next => action => {
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

    // THE MAGIC: dispatched action matches a connected type, so we generate a location-aware action and also
    // as a result update location reducer state. (ALSO NOTE: we check if the received action `isLocationAction`
    // to prevent double dispatches coinciding with browser history changes within `_handleBrowserBackNext`)
    else if (ROUTES_MAP[action.type] && !isLocationAction(action)) {
      action = createMiddlewareAction(action, ROUTES_MAP, prevLocation)
      prevLocation = action.meta.location.current
    }

    const nextAction = next(action)
    const nextState = store.getState()

    // IMPORTANT: keep currentPathname up to date for comparison to prevent double dispatches
    // between BROWSER back/forward button usage vs middleware-generated actions
    currentPathname = changeAddressBar(nextState[locationKey], currentPathname, HISTORY)
    changePageTitle(windowDocument, nextState[titleKey])

    return nextAction
  }


  /** ENHANCER
   *  1)  dispatches actions with types and payload extracted from the URL pattern
   *      when the browser history changes
   *  2)  on load of the app dispatches an action corresponding to the initial url
  */

  const enhancer: StoreEnhancer<*, *> = createStore => (reducer, preloadedState, enhancer): Store<*, *> => {
    const store = createStore(reducer, preloadedState, enhancer)

    const state = store.getState()
    const location = state[locationKey]

    if (!location || !location.pathname) {
      throw new Error(`[pure-redux-router] you must provide the key of the location
        reducer state and properly assigned the location reducer to that key.`)
    }

    const dispatch = store.dispatch.bind(store)
    HISTORY.listen(_handleBrowserBackNext.bind(null, dispatch))

    // dispatch the first location-aware action
    const action = createHistoryAction(currentPathname, ROUTES, ROUTE_NAMES, prevLocation, 'load')
    prevLocation = action.meta.location.current
    store.dispatch(action)

    return store
  }


  /* INTERNAL UTILITY FUNCTIONS (THEY ARE IN THIS FILE BECAUSE THEY RELY ON OUR ENCLOSED STATE) **/

  const _handleBrowserBackNext = (dispatch: Dispatch<*>, location: HistoryLocation) => {
    if (location.pathname !== currentPathname) { // insure middleware hasn't already handled location change
      if (typeof onBackNext === 'function') {
        onBackNext(location)
      }

      const action = createHistoryAction(location.pathname, ROUTES, ROUTE_NAMES, prevLocation, 'backNext')

      prevLocation = action.meta.location.current
      currentPathname = location.pathname

      dispatch(action) // dispatch route type + payload as it changes via back/next buttons usage
    }
  }

  _exportedGo = (pathname: string) =>
    pathToAction(pathname, ROUTES, ROUTE_NAMES) // only pathname arg expected in client code

  _history = HISTORY


  /* RETURN TRIUMVERATE */

  return {
    reducer,
    middleware,
    enhancer,

    // returned only for tests (not for use in application code)
    _handleBrowserBackNext,
    _exportedGo,
    windowDocument,
    history,
  }
}

/** SIDE EFFECT:
 *  Client code needs a simple go to path action creator.
 *  `exportedGo` gets replaced with a function aware of private instance variables.
 *  NOTE: it's primarily for use by https://github.com/celebvidy/pure-redux-router-link 's `<Link /> component.
 *
 *  NOTE: it will not harm SSR, so long as you don't use it server side. So that means DO NOT
 *  simulate clicking links server side--and dont do that, dispatch actions instead).
*/

let _exportedGo
let _history

export const go = (pathname: string) =>
  _exportedGo(pathname)


/** SIDE EFFECT:
 *  it's only recommended you use `back` when prototyping--it's better to use the above mentioned <Link />
 *  component to generate SEO friendly urls with hrefs pointing to the previous URL. You can
 *  use your redux state to determine the previous URL. The location reducer will also contain the info.
 *  But if you must, this is here for convenience and it basically simulates the user pressing the browser
 *  back button, which of course the system picks up and parses into an action.
 */

export const back = () =>
  _history.goBack()
