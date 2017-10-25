// @flow
import type { StoreEnhancer } from 'redux'
import createBrowserHistory from 'rudy-history/createBrowserHistory'
import createMemoryHistory from 'rudy-history/createMemoryHistory'
import { stripTrailingSlash, addLeadingSlash } from 'rudy-history/PathUtils'
import pathToAction from './pure-utils/pathToAction'
import { nestHistory } from './pure-utils/nestAction'
import isLocationAction from './pure-utils/isLocationAction'
import isServer from './pure-utils/isServer'
import isReactNative from './pure-utils/isReactNative'
import callBeforeEnter from './pure-utils/callBeforeEnter'
import callThunk from './pure-utils/callThunk'
import isRedirect from './pure-utils/isRedirect'
import performPluginWork from './pure-utils/performPluginWork'
import pathnamePlusSearch from './pure-utils/pathnamePlusSearch'
import canUseDom from './pure-utils/canUseDom'
import isClientLoadSSR from './pure-utils/isClientLoadSSR'

import callBeforeLeave, { setConfirm } from './pure-utils/callBeforeLeave'

import historyCreateAction from './action-creators/historyCreateAction'
import middlewareCreateAction from './action-creators/middlewareCreateAction'
import middlewareCreateNotFoundAction from './action-creators/middlewareCreateNotFoundAction'

import createLocationReducer, {
  getInitialState
} from './reducer/createLocationReducer'
import { NOT_FOUND, ADD_ROUTES } from './index'

import type {
  Dispatch as Next,
  RoutesMap,
  Route,
  Options,
  Action,
  ActionMetaLocation,
  ReceivedAction,
  Location,
  LocationState,
  History,
  HistoryLocation,
  Store
} from './flow-types'

const __DEV__ = process.env.NODE_ENV !== 'production'

/** PRIMARY EXPORT - `connectRoutes(routeMap, options)`:
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
 *  location reducer listens to, and which userland reducers can also make use of.
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

export default (routesMap: RoutesMap = {}, options: Options = {}) => {
  if (__DEV__) {
    if (options.restoreScroll && typeof options.restoreScroll !== 'function') {
      throw new Error(
        `[redux-first-router] invalid \`restoreScroll\` option. Using
        https://github.com/faceyspacey/redux-first-router-restore-scroll
        please call \`restoreScroll\` and assign it the option key
        of the same name.`
      )
    }
  }

  /** SETUP VARIABLES (I.E. INTERNAL ENCLOSED STATE - PER INSTANCE FOR SSR!) */

  // 1) OPTIONS SETUP

  const {
    notFoundPath = '/not-found',
    scrollTop = false,
    location,
    title,
    beforeLeave,
    beforeEnter,
    onEnter,
    onLeave,
    thunk,
    onComplete,
    onBackNext,
    restoreScroll,
    querySerializer,
    extra
  }: Options = options

  // The options must be initialized ASAP to prevent empty options being
  // received in `getOptions` after the initial events emitted
  _options = options

  // create an empty route for
  routesMap[NOT_FOUND] = routesMap[NOT_FOUND] || {}

  // 2) HISTORY PACKAGE STUFF

  const isBrowser = canUseDom && process.env.NODE_ENV !== 'test'
  const standard = isBrowser ? createBrowserHistory : createMemoryHistory
  const createHistory = options.createHistory || standard
  const entries = options.initialEntries || '/' // fyi only memoryHistory needs initialEntries
  const initialEntries = typeof entries === 'string' ? [entries] : entries

  if (options.basename) {
    options.basename = stripTrailingSlash(addLeadingSlash(options.basename))
  }

  const history = createHistory({
    basename: options.basename,
    initialEntries
  })

  // 3) SELECTORS

  const selectLocationState =
    typeof location === 'function'
      ? location
      : location ? state => state[location] : state => state.location

  const selectTitleState =
    typeof title === 'function'
      ? title
      : title ? state => state[title] : state => state.title

  // 4) CURRENT PATH TRACKER (FOR COMPARISONS TO DETERMINE WHETHER TO DISPATCH OR CALL HISTORY.PUSH)

  let currentPath: string = pathnamePlusSearch(history.location)

  // 5) INITIAL STATES

  const initialAction = pathToAction(currentPath, routesMap)
  const { type, payload, meta }: ReceivedAction = initialAction

  const INITIAL_LOCATION_STATE: LocationState = getInitialState(
    currentPath,
    meta,
    type,
    payload,
    routesMap,
    history
  )

  // 4) PREVIOUS STATE TRACKING (ALSO FOR VARIOUS COMPARISONS, PLUS PROVIDING PREV STATE IN REDUCERS/ACTIONS)

  let prevLength = history.length // used by `historyCreateAction` to calculate if moving along history.entries track in RN
  let prevLocation: Location = {
    // maintains previous location state in location reducer
    pathname: '',
    type: '',
    payload: {},
    kind: ''
  }

  // these values are used to hold temp state between consecutive runs through
  // the middleware (i.e. from new dispatches triggered within the middleware)
  const tempVals = {}

  // 5) IMPORTANT EXPORTS

  const reducer = createLocationReducer(INITIAL_LOCATION_STATE, routesMap)
  const firstRoute = () => _firstRoute && _firstRoute()

  // will be assigned by enhancer within `createStore` after `connectRoutes` returns
  let _firstRoute

  // 6) PLUGIN STUFF

  // A) SCROLL BEAHVIOR
  const scrollBehavior = restoreScroll && restoreScroll(history)

  // B) REACT NAVIGATION STUFF

  let navigators
  let patchNavigators
  let actionToNavigation
  let navigationToAction

  if (options.navigators) {
    // redux-first-router-navigation reformats the `navigators` option
    // to have the navigators nested one depth deeper, so as to include
    // the various helper functions from its package
    if (__DEV__ && !options.navigators.navigators) {
      throw new Error(
        `[redux-first-router] invalid \`navigators\` option. Pass your map
        of navigators to the default import from 'redux-first-router-navigation'.
        Don't forget: the keys are your redux state keys.`
      )
    }

    navigators = options.navigators.navigators
    patchNavigators = options.navigators.patchNavigators
    actionToNavigation = options.navigators.actionToNavigation
    navigationToAction = options.navigators.navigationToAction

    patchNavigators(navigators)
  }

  /** MIDDLEWARE
   *  1)  dispatches actions with location info in the `meta` key by matching the received action
   *      type + payload to express style routePaths (which also results in location reducer state updating)
   *  2)  changes the address bar url, page title, etc, if the currentPathName changes, while
   *      avoiding collisions with simultaneous browser history changes
  */

  const middleware = (store: Store) => (next: Next) => (action: Object) => {
    if (isServer() && isRedirect(action)) return action
    // if (isLocationAction(action)) return next(action)

    // 1) PLUGIN PRE-TRANSFORMS

    // transformation specific to React Navigation
    let navigationAction

    if (navigators && action.type.indexOf('Navigation/') === 0) {
      const tools = navigationToAction(navigators, store, routesMap, action)
      navigationAction = tools.navigationAction
      action = tools.action
    }

    // 2) DISCOVER ROUTE!
    const route = routesMap[action.type]

    // 3) SHORT-CIRCUIT SIMPLE NON-ROUTE ACTIONS:

    // A) ADD ROUTES DYNAMICALLY
    // code-splitting functionality to add routes after store is initially configured
    if (action.type === ADD_ROUTES) {
      routesMap = { ...routesMap, ...action.payload.routes }
      return next(action)
    }

    // B) SKIP ERRORS AND NON-ROUTE ACTIONS
    // We have chosen to not change routes on errors, while letting other middleware
    // handle it. Perhaps in the future we will explicitly handle it (as an option)
    if (action.error || !route) return next(action)

    // C) PATHLESS "ROUTES"
    // We now support "routes" without paths for the purpose of dispatching thunks according
    // to the same idiom as full-fledged routes. The purpose is uniformity of async actions.
    // The URLs will NOT change.
    if (!route.path && typeof route.thunk === 'function') {
      const thunk = route.thunk
      const nextAction = next(action)

      const { dispatch, getState } = store
      const bag = { action: nextAction, ...extra }
      const thunkReturn = thunk(dispatch, getState, bag)

      return thunkReturn || nextAction
    }

    // 4) PRIMARY WORK - TRANSFORM ROUTE ACTIONS:

    // only transform actions that aren't already transformed
    if (route && !isLocationAction(action)) {
      // A) REGULAR ROUTE ACTION: generate a location-aware action
      if (action.type !== NOT_FOUND) {
        action = middlewareCreateAction(
          action,
          routesMap,
          prevLocation,
          history,
          notFoundPath,
          querySerializer
        )
      }
      else {
        // B) NOT_FOUND ROUTE ACTION: user dispatched `NOT_FOUND`, so we add info to action
        action = middlewareCreateNotFoundAction(
          action,
          selectLocationState(store.getState()),
          prevLocation,
          history,
          notFoundPath
        )
      }

      // avoid double dispatch-ing the same route
      if (action.meta.location.current.pathname === currentPath) return action
    }

    // 5) PLUGIN POST-TRANSFORMS

    // additional transformation specific to React Navigation
    if (navigators) {
      action = actionToNavigation(navigators, action, navigationAction, route)
    }

    // 6) PRIMARY WORK - DISPATCH LIFECYLE:

    // A) ON_BEFORE_CHANGE + BEFORE_LEAVE (allows for redirets + route blocking respectively)
    const skip = _beforeRouteChange(store, route, action, history)
    if (skip) return skip === true ? false : skip // skip contains new redirected action + thunk's return

    // B) UPDATE ADDRESS BAR (note: just like in history listener, we do this before updating state)
    _middlewareAttemptChangeUrl(action.meta.location, history)

    // C) DISPATCH NEXT ACTION (state will update to reflect route change)
    const nextAction = next(action)
    // const nextAction = store.dispatch(action)

    // D) ON_AFTER_CHANGE, THUNKS + PLUGIN WORK
    const thunkReturn = _afterRouteChange(store, route, nextAction)

    // E) INTELLIGENT THUNK-AWARE RETURN (return a route thunk's return or the plain action object)
    return typeof thunkReturn === 'object' && thunkReturn.then
      ? thunkReturn.then(res => res || nextAction)
      : thunkReturn || nextAction
  }

  const _beforeRouteChange = (
    store: Store,
    route: Route,
    action: Action,
    history: History
  ) => {
    const { current } = action.meta.location

    // 1) SET PREVIOUS STATES FOR PROVIDING `prev` INFO + MAKING INTERNAL COMPARISONS
    prevLocation = current
    prevLength = history.length

    // 2) SHORT-CIRCUIT IF CLIENT RECEIVED INITIAL STATE FROM SSR
    if (isClientLoadSSR(store)) return

    // 3) SHOW CONFIRM LEAVE & SHORT-CIRCUIT
    const block = callBeforeLeave(current)
    if (block) return block // skip

    // 4) HANDLE REDIRECTS IN `beforeEnter`
    return callBeforeEnter(
      store,
      route,
      action,
      routesMap,
      tempVals,
      currentPath,
      extra,
      beforeEnter
    )
  }

  const _middlewareAttemptChangeUrl = (
    location: ActionMetaLocation,
    history: History
  ) => {
    const nextPath = pathnamePlusSearch(location.current)

    if (nextPath !== currentPath) {
      currentPath = nextPath // IMPORTANT: insure history wasn't initiator

      // for React Native, in the case `back` or `next` is  not called directly, `middlewareCreateAction` may emulate
      // `history` backNext actions to support features such as scroll restoration. In those cases, we need to prevent
      // pushing new routes on to the entries array. `stealth` is a React Navigation feature for changing StackNavigators
      // without triggering other navigators (such as a TabNavigator) to change as well. It allows you to reset hidden StackNavigators.
      const { kind } = location
      const manuallyInvoked = kind && /back|next|pop|stealth/.test(kind)

      if (!manuallyInvoked) {
        const isRedirect = kind === 'redirect' && !tempVals.beforeEnter
        const method = isRedirect ? 'replace' : 'push'
        history[method](currentPath) // URL CHANGES!

        tempVals.beforeEnter = false
      }
    }

    // now we can finally set the history on the action since we get its
    // value from the `history` whose value only changes after `push()`
    if (isReactNative()) {
      location.history = nestHistory(history)
    }
  }

  const _afterRouteChange = (store: Store, route: Route, action: Action) => {
    // 1) PREPARE CONFIRM LEAVE FOR FUTURE DISPATCH WHEN LEAVING ROUTE
    setConfirm(store, route, beforeLeave) // beforeLeave

    // 2) CALL ROUTE THUNK + ON_AFTER_CHANGE ETC
    const bag = { action, ...extra }
    performPluginWork(
      store,
      route,
      bag,
      scrollTop,
      onBackNext,
      onEnter,
      onLeave
    )
    return callThunk(store, route, action, bag, routesMap, thunk, onComplete)
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
  ): Store => {
    // insure routesMap is transferred from server to client (it cant be stringified during SSR)
    if (!isServer() && preloadedState && selectLocationState(preloadedState)) {
      selectLocationState(preloadedState).routesMap = routesMap
    }

    const store = createStore(reducer, preloadedState, enhancer)
    const state = store.getState()
    const location = state && selectLocationState(state)

    if (!location || !location.pathname) {
      throw new Error('[rudy] your location reducer is not setup.')
    }

    history.listen(_historyAttemptDispatchAction.bind(null, store))

    // ACTION CREATOR: client code must call `dispatch(firstRoute())` to kick things off!
    _firstRoute = () =>
      historyCreateAction(
        currentPath,
        routesMap,
        prevLocation,
        history,
        'load',
        querySerializer
      )

    _store = store
    return store
  }

  const _historyAttemptDispatchAction = (
    store: Store,
    location: HistoryLocation,
    historyAction: string
  ) => {
    const nextPath = pathnamePlusSearch(location)

    // IMPORTANT: insure middleware hasn't already handled location change:
    if (nextPath !== currentPath) {
      const kind = historyAction === 'REPLACE' ? 'redirect' : historyAction

      // THE MAGIC: parse the address bar path into a matched action
      const action = historyCreateAction(
        nextPath,
        routesMap,
        prevLocation,
        history,
        kind.toLowerCase(),
        querySerializer,
        currentPath,
        prevLength
      )

      currentPath = nextPath // IMPORTANT: must happen before dispatch (to prevent double handling)
      store.dispatch(action) // dispatch route type + payload corresponding to browser back/forward usage
    }
  }

  /* SIDE_EFFECTS - client-only state that must escape closure */

  _history = history
  _scrollBehavior = scrollBehavior
  _selectLocationState = selectLocationState
  _selectTitleState = selectTitleState
  let _store

  _updateScroll = (performedByUser: boolean = false) => {
    if (isServer()) return

    if (scrollBehavior) {
      if (!scrollBehavior.manual) {
        const nextLocation = _selectLocationState(_store.getState())
        scrollBehavior.updateScroll(prevLocation, nextLocation)
      }
    }
    else if (__DEV__ && performedByUser) {
      throw new Error(
        `[redux-first-router] you must set the \`restoreScroll\` option before
        you can call \`updateScroll\``
      )
    }
  }

  /* RETURN  */

  return {
    firstRoute,
    reducer,
    middleware,
    enhancer,
    history,

    // returned only for tests (not for use in application code)
    _middlewareAttemptChangeUrl,
    _afterRouteChange,
    _historyAttemptDispatchAction
  }
}

/** SIDE EFFECTS:
 *  Client code needs a simple `push`,`back` + `next` functions because it's convenient for
 *  prototyping. It will not harm SSR, so long as you don't use it server side. So if you use it, that means DO NOT
 *  simulate clicking links server side--and dont do that, dispatch actions to setup state instead.
 *
 *  THE IDIOMATIC WAY: instead use https://github.com/faceyspacey/redux-first-router-link 's `<Link />`
 *  component to generate SEO friendly urls. As its `to` prop, you pass it a path, array of path
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
let _selectLocationState
let _selectTitleState
let _options

export const push = (pathname: string, state?: any) =>
  _history.push(pathname, state)

export const replace = (pathname: string, state?: any) =>
  _history.replace(pathname, state)

export const back = () => _history.goBack()

export const next = () => _history.goForward()

export const go = (n: number) => _history.go(n)

export const canGo = (n: number) => _history.canGo(n)

export const canGoBack = (): boolean => !!_history.entries[_history.index - 1]

export const canGoForward = (): boolean =>
  !!_history.entries[_history.index + 1]

export const prevPath = (): ?string => {
  const entry = _history.entries[_history.index - 1]
  return entry && entry.pathname
}

export const nextPath = (): ?string => {
  const entry = _history.entries[_history.index + 1]
  return entry && entry.pathname
}

export const history = () => _history

export const scrollBehavior = () => _scrollBehavior

export const updateScroll = (performedByUser?: boolean = true) =>
  _updateScroll && _updateScroll(performedByUser)

export const selectTitleState = (state: Object) =>
  selectTitleState && _selectTitleState(state)

export const selectLocationState = (state: Object) =>
  _selectLocationState && _selectLocationState(state)

export const getOptions = (): Options => _options || {}
