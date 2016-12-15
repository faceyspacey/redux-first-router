import pathToRegexp from 'path-to-regexp'

import formatParams from './pure-utils/formatParams'
import parsePath from './pure-utils/parsePath'
import nestAction from './pure-utils/nestAction'
import routesDictToArray from './pure-utils/routesDictToArray'

import { INIT, NOT_FOUND } from './actionCreators'


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

export function connectTypes(routes={}, history, options) {
  if(process.env.NODE_ENV !== 'production') {
    if(!history) {
      throw new Error('invalid-history-argument', `Using the 'history' package on NPM, please provide 
        a history object as a second parameter. The history object will be the return of 
        createBrowserHistory() (or in React Native or Node: createMemoryHistory()).
        See: https://github.com/mjackson/history`)
    }
  }
  
  const HISTORY = history                                    //history object created via createBrowserHistory or createMemoryHistory (using history package) passed to createLocationReducer(routes, history)
  const ROUTES_DICT = routes                                 //{HOME: '/home', INFO: '/info/:param'} -- our route "constants" defined by our user (typically in configureStore.js)
  const ROUTE_NAMES = Object.keys(ROUTES_DICT)               //['HOME', 'INFO', 'ETC']
  const ROUTES = routesDictToArray(ROUTE_NAMES, ROUTES_DICT) //['/home', '/info/:param/', '/etc/:etc']

  let {type, payload} = parsePath(history.location.pathname, ROUTES, ROUTE_NAMES)
  let currentPathname
  let initialized = false

  const INITIAL_LOCATION_STATE = {
    pathname: history.location.pathname,
    type,
    payload,
    prev: {                     
      pathname: null,
      type: null,
      payload: null,
    },
    history: typeof window !== 'undefined' ? history : undefined,
    hydrated: typeof window !== 'undefined' ? false : true,
  }

  const {
    onBackNext, 
    location: locationKey='location',
    ready: readyKey,
    title: titleKey,
  } = options


  /** LOCATION REDUCER: */

  function locationReducer(state=INITIAL_LOCATION_STATE, action) {
    if(ROUTES_DICT[action.type] || action.type === NOT_FOUND) {
      state = {
        pathname: action.location.current.pathname,
        type: action.type,
        payload: action.payload || {}, //provide payload so reducers can optionally slice location state and get initial params from URL without the init action dispatched
        prev: action.location.prev || state.prev,
        history: state.history,
        hydrated: typeof window !== 'undefined' ? undefined : true,
      }

      if(action.location.load) {
        state.load = true
      }

      if(action.location.backNext) {
        state.backNext = true
      }
    }

    return state
  }


  /** MIDDLEWARE */

  function addressBarMiddleware(store) {
    return next => action => {
      if(action.error) {
        if(process.env.NODE_ENV !== 'production') {
          console.warn(`AddressBar: location update did not dispatch as your action has an error.`)
        }
      }

      else if(action.type === INIT) {
        action = initAction(action.payload.pathname)
      }
      
      // user decided to dispatch `NOT_FOUND`, so we fill in the missing location info
      else if(action.type === NOT_FOUND && !action.location) {
        let pathname = store.getState().location;
        action = prepareAction(pathname, {type: NOT_FOUND, payload: action.payload || {}})
      }

      // browser back/forward button usage will dispatch with locations and dont need to be re-handled
      else if(ROUTES_DICT[action.type] && !action.location) { 
        action = middlewareAction(action, ROUTES_DICT[action.type], store.getState().location)
      }

      return next(action)
    }
  }

  /** ENHANCER */

  function enhancer(createStore) {
    return (reducer, preloadedState, enhancer) => {
      let store = createStore(reducer, preloadedState, enhancer)
      listen(store)
      return store
    }
  }

  /** ADDRESS BAR & STATE LISTENER */
  
  function listen(store) {
    let prevState
    let dispatch = store.dispatch.bind(store)
    let state = store.getState()

    if(!state[locationKey] || !state[locationKey].pathname) {
      throw new Error('no-location-reducer', `
        You must provide the key of the location reducer state 
        or properly assigned the location reducer to the 'location' state key.
      `)
    }

    if(typeof window !== 'undefined') {
      HISTORY.listen(handleBrowserBackNextButtons.bind(null, dispatch))

      store.subscribe(() => {
        let state = store.getState()
        onUpdateState(dispatch, state, prevState)
        prevState = state
      })
    }

    //call once at start to populate location reducer 
    //and, on `ready`, dispatches the `type` of the location reducer state
    onUpdateState(dispatch, state) 
    prevState = state
  }

  function onUpdateState(dispatch, next, prev={}) {
    let location = next[locationKey]
    let prevLocation = prev[locationKey]

    let title = next[titleKey]
    let prevTitle = prev[titleKey]
    
    let ready = next[readyKey]

    if(initialized) {
      changeAddressBar(location, prevLocation)
    }
    else if(ready && !location.hydrated) {
      let action = initAction(location.pathname) 
      dispatch(action) //dispatch entrance route type
    }

    changePageTitle(title, prevTitle)

    //server provided initialState, so we dont need to dispatch initAction
    //and are safe to changeAddressBar from here on out
    if(location.hydrated) {
      initialized = true
    }
  }

  function handleBrowserBackNextButtons(dispatch, nextLocation) {
    //if browser URL was not changed in response to location reducer state,
    //i.e. from browser back button instead
    if(nextLocation.pathname !== currentPathname) { 
      onBackNext && onBackNext(nextLocation)
      currentPathname = nextLocation.pathname

      let action = backNextAction(currentPathname)
      dispatch(action) //dispatch route type as it changes via back/next buttons usage
    } 
  }

  function changeAddressBar(location, prevLocation) {
    if(!location || !prevLocation) return

    if(location.pathname !== currentPathname) {
      currentPathname = location.pathname
      HISTORY.push({pathname: currentPathname})
    }
  }

  function changePageTitle(title, prevTitle) {
    if(typeof window === 'undefined') return

    if(typeof title === 'string' && title !== prevTitle) { //compare location type as well, since title reducer may not
      document.title = title
    }
  }

  
  /** ACTION CREATORS: */

  function middlewareAction(action, route, location) {
    try {
      let {routePath, params} = formatParams(route, action.payload)
      let toPath = pathToRegexp.compile(routePath)
      let pathname = toPath(params)

      return prepareAction(pathname, action) 
    }
    catch(e) {
      //DEVELOPER DISPATCHED AN INVALID type + payload
      
      //preserve previous pathname to keep app stable for future correct actions that depend on it
      let pathname = location && location.pathname || null 
      return prepareAction(pathname, {type: NOT_FOUND, payload: action.payload})
    }
  }

  //for exclusive use by initAction and browser back/forward button
  function updateAction(pathname, routes=ROUTES, routeNames=ROUTE_NAMES) {
    let action = parsePath(pathname, routes, routeNames)
    return prepareAction(pathname, action) 
  }

  function initAction(pathname) {
    initialized = true //only after initialized will new history locations be pushed on to the address bar

    let action = updateAction(pathname)
    action.location.load = true
    return action
  }

  function backNextAction(pathname) {
    let action = updateAction(pathname)
    action.location.backNext = true
    return action
  }

  let prev = null

  function prepareAction(pathname, receivedAction) {
    let action = nestAction(pathname, receivedAction, prev)
    prev = {...action.location.current}
    return action
  }

  //NOTE: ROUTES and ROUTE_NAMES put in for purity/testability, and only pathname is expected to be provided
  exportedGo = (pathname, routes=ROUTES, routeNames=ROUTE_NAMES) => {
    return parsePath(pathname, routes, routeNames) //prepareAction will eventually be called after client dispatches and middleware resolves it
  }

  return {
    reducer: locationReducer,
    middleware: addressBarMiddleware,
    enhancer,
  }
}

/** SIDE EFFECT:
 *  Client code needs a simple go to path function. `exportedGo` gets replaced with a function aware of private instance variables.
 *  NOTE: it's also used by https://github.com/celebvidy/pure-redux-router-link 's `<Link /> component.
 *  NOTE: it will not harm SSR (unless you simulate clicking links server side--and dont do that, dispatch actions instead).
*/

let exportedGo = function() {
  if(process.env.NODE_ENV !== 'production') {
    console.warn(`
      you are calling 'go' before pure-redux-router is initialized. 
      Find a way to not do that so you don't miss your initial dispatches :)
    `)
  }
}

export function go(pathname) {
  return exportedGo(pathname)
}
