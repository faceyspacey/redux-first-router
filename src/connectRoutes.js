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

import createLocationReducer, {
  getInitialState
} from './reducer/createLocationReducer'
import { NOT_FOUND } from './index'

import type {
  Dispatch,
  RoutesMap,
  Route,
  Options,
  ReceivedAction,
  Location,
  LocationState,
  History,
  HistoryLocation,
  Document
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
  options: Options = {}
) => {
  if (process.env.NODE_ENV !== 'production') {
    if (!history) {
      throw new Error(
        `[redux-first-router] invalid \`history\` agument. Using the 'history' package on NPM,
        please provide a \`history\` object as a second parameter. The object will be the
        return of createBrowserHistory() (or in React Native or Node: createMemoryHistory()).
        See: https://github.com/mjackson/history`
      )
    }

    if (options.restoreScroll && typeof options.restoreScroll !== 'function') {
      throw new Error(
        `[redux-first-router] invalid \`restoreScroll\` option. Using
        https://github.com/faceyspacey/redux-first-router-restore-scroll
        please call \`restoreScroll\` and assign it the option key
        of the same name.`
      )
    }
  }

  /** INTERNAL ENCLOSED STATE (PER INSTANCE FOR SSR!) */
  let currentPathname: string = history.location.pathname // very important: used for comparison to determine address bar changes
  let prevState = {} // used only to pass to pass as 1st argument to restore-scroll package if used
  let nextState = {} // used only to pass to pass as 2nd argument to restore-scroll package if used
  let prevLocation: Location = {
    // maintains previous location state in location reducer
    pathname: '',
    type: '',
    payload: {}
  }

  const {
    location: locationKey = 'location',
    title: titleKey = 'title',
    scrollTop = false,
    onBeforeChange,
    onAfterChange,
    onBackNext,
    restoreScroll
  }: Options = options

  const scrollBehavior = restoreScroll && restoreScroll(history)

  const { type, payload }: ReceivedAction = pathToAction(
    currentPathname,
    routesMap
  )
  const INITIAL_LOCATION_STATE: LocationState = getInitialState(
    currentPathname,
    type,
    payload,
    routesMap,
    history
  )

  const reducer = createLocationReducer(INITIAL_LOCATION_STATE, routesMap)
  const thunk = createThunk(routesMap, locationKey)

  const windowDocument: Document = getDocument() // get plain object for window.document if server side

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
        console.warn(
          'redux-first-router: location update did not dispatch as your action has an error.'
        )
      }
    }
    else if (action.type === NOT_FOUND && !isLocationAction(action)) {
      // user decided to dispatch `NOT_FOUND`, so we fill in the missing location info
      const { pathname } = store.getState().location
      const { payload } = action

      action = nestAction(
        pathname,
        { type: NOT_FOUND, payload },
        prevLocation,
        history
      )
      prevLocation = action.meta.location.current
    }
    else if (route && !isLocationAction(action)) {
      // THE MAGIC: dispatched action matches a connected type, so we generate a
      // location-aware action and also as a result update location reducer state.
      action = middlewareCreateAction(action, routesMap, prevLocation, history)
      prevLocation = action.meta.location.current
    }

    if (route) {
      prevState = store.getState()

      if (onBeforeChange) {
        const dispatch = middleware(store)(next) // re-create middleware's position in chain
        onBeforeChange(dispatch, store.getState)
      }
    }

    const nextAction = next(action)

    // perform various actions if a route was matched and its corresponding action dispatched:
    if (route) {
      nextState = store.getState()
      _afterRouteChange(store, next, route)
    }

    return nextAction
  }

  const _afterRouteChange = (store: Object, next: Dispatch, route: Route) => {
    const dispatch = middleware(store)(next) // re-create middleware's position in chain

    // IMPORTANT: keep currentPathname up to date for comparison to prevent double dispatches
    // between BROWSER back/forward button usage vs middleware-generated actions
    _middlewareAttemptChangeUrl(
      nextState[locationKey],
      nextState[titleKey],
      history
    )

    if (typeof route === 'object') {
      attemptCallRouteThunk(dispatch, store.getState, route)
    }

    if (scrollTop && typeof window !== 'undefined') {
      setTimeout(() => window.scrollTo(0, 0), 0)
    }

    if (onAfterChange) {
      setTimeout(() => onAfterChange(dispatch, store.getState), 0)
    }
  }

  const _middlewareAttemptChangeUrl = (
    locationState: LocationState,
    title: ?string,
    history: History
  ) => {
    // IMPORTANT: insure history hasn't already handled location change
    if (locationState.pathname !== currentPathname) {
      currentPathname = locationState.pathname // IMPORTANT: must happen before history.push() (to prevent double handling)

      // for React Native `middlewareCreateAction` may emulate
      // `history` backNext actions to support features such
      // as scroll restoration, in case `back` or `next` is
      // not called directly. In those cases, we need to prevent
      // pushing new routes on to the entries array.
      const manuallyInvoked = locationState.backNext

      if (!manuallyInvoked) {
        const method = locationState.redirect ? 'replace' : 'push'
        history[method](currentPathname) // change address bar corresponding to matched actions from middleware
      }

      changePageTitle(windowDocument, title)
    }
  }

  /** ENHANCER
   *  1)  dispatches actions with types and payload extracted from the URL pattern
   *      when the browser history changes
   *  2)  on load of the app dispatches an action corresponding to the initial url
   */

  const enhancer: StoreEnhancer<*, *> = createStore => (
    reducer,
    preloadedState,
    enhancer
  ): Store<*, *> => {
    // routesMap stored in location reducer will be stringified as it goes from the server to client
    // and as a result functions in route objects will be removed--here's how we insure we bring them back
    if (
      typeof window !== 'undefined' &&
      preloadedState &&
      preloadedState[locationKey]
    ) {
      preloadedState[locationKey].routesMap = routesMap
    }

    const store = createStore(reducer, preloadedState, enhancer)
    const state = store.getState()
    const location = state[locationKey]

    if (!location || !location.pathname) {
      throw new Error(
        `[redux-first-router] you must provide the key of the location
        reducer state and properly assigned the location reducer to that key.`
      )
    }

    history.listen(_historyAttemptDispatchAction.bind(null, store))

    // update the scroll position after initial rendering of page
    setTimeout(() => _updateScroll(false))

    // dispatch the first location-aware action so initial app state is based on the url on load
    if (!location.hasSSR || isServer()) {
      // only dispatch on client before SSR is setup, which passes state on to the client
      const action = historyCreateAction(
        currentPathname,
        routesMap,
        prevLocation,
        history,
        'load'
      )
      prevLocation = action.meta.location.current
      store.dispatch(action)
    }

    return store
  }

  const _historyAttemptDispatchAction = (
    store: Store<*, *>,
    location: HistoryLocation,
    historyAction: string
  ) => {
    if (location.pathname !== currentPathname) {
      // IMPORTANT: insure middleware hasn't already handled location change
      currentPathname = location.pathname // IMPORTANT: must happen before dispatch (to prevent double handling)

      // THE MAGIC: parse the address bar path into a matched action
      const action = historyCreateAction(
        location.pathname,
        routesMap,
        prevLocation,
        history,
        'backNext'
      )

      prevLocation = action.meta.location.current
      store.dispatch(action) // dispatch route type + payload corresponding to browser back/forward usage

      if (typeof onBackNext === 'function') {
        onBackNext(store.dispatch, store.getState)
      }
    }

    _updateScroll(false)
  }

  /* SIDE_EFFECTS - client-only state that must escape closure */

  _history = history
  _scrollBehavior = scrollBehavior

  _updateScroll = (performedByUser: boolean = true) => {
    if (scrollBehavior) {
      if (!scrollBehavior.manual) {
        scrollBehavior.updateScroll(prevState, nextState)
      }
    }
    else if (process.env.NODE_ENV !== 'production' && performedByUser) {
      throw new Error(
        `[redux-first-router] you must set the \`restoreScroll\` option before
        you can call \`updateScroll\``
      )
    }
  }

  /* RETURN  */

  return {
    reducer,
    middleware,
    enhancer,
    thunk,

    // returned only for tests (not for use in application code)
    _middlewareAttemptChangeUrl,
    _historyAttemptDispatchAction,
    windowDocument,
    history
  }
}

/** SIDE EFFECTS:
 *  Client code needs a simple `push`,`back` + `next` functions because it's convenient for
 *  prototyping. It will not harm SSR, so long as you don't use it server side. So if you use it, that means DO NOT
 *  simulate clicking links server side--and dont do that, dispatch actions to setup state instead.
 *
 *  THE IDIOMATIC WAY: instead use https://github.com/faceyspacey/redux-first-router-link 's `<Link />`
 *  component to generate SEO friendly urls. As its `href` prop, you pass it a path, array of path
 *  segments or action, and internally it will use `connectRoutes` to change the address bar and
 *  dispatch the correct final action from middleware.
 *
 *  NOTE ON BACK FUNCTIONALITY: The better way to accomplish a back button is to use your redux state to determine
 *  the previous URL. The location reducer will also contain relevant info. But if you must,
 *  this is here for convenience and it basically simulates the user pressing the browser
 *  back button, which of course the system picks up and parses into an action.
 */

let _history
let _scrollBehavior
let _updateScroll

export const push = (pathname: string) => _history.push(pathname)

export const replace = (pathname: string) => _history.replace(pathname)

export const back = () => _history.goBack()

export const next = () => _history.goForward()

export const go = (n: number) => _history.go(n)

export const canGo = (n: number) => _history.canGo(n)

export const scrollBehavior = () => _scrollBehavior

export const updateScroll = () => _updateScroll && _updateScroll()
