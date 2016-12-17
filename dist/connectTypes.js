'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = connectTypes;
exports.go = go;

var _actionToPath = require('./pure-utils/actionToPath');

var _actionToPath2 = _interopRequireDefault(_actionToPath);

var _pathToAction2 = require('./pure-utils/pathToAction');

var _pathToAction3 = _interopRequireDefault(_pathToAction2);

var _nestAction = require('./pure-utils/nestAction');

var _nestAction2 = _interopRequireDefault(_nestAction);

var _isLocationAction = require('./pure-utils/isLocationAction');

var _isLocationAction2 = _interopRequireDefault(_isLocationAction);

var _routesDictToArray = require('./pure-utils/routesDictToArray');

var _routesDictToArray2 = _interopRequireDefault(_routesDictToArray);

var _actions = require('./actions');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

function connectTypes() {
  var routes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var history = arguments[1];
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  if (process.env.NODE_ENV !== 'production') {
    if (!history) {
      throw new Error('\n        [pure-redux-rouer] invalid `history` agument. Using the \'history\' package on NPM, \n        please provide a `history` object as a second parameter. The object will be the return of \n        createBrowserHistory() (or in React Native or Node: createMemoryHistory()).\n        See: https://github.com/mjackson/history');
    }
  }

  /** INTERNAL CLOSURE STATE (PER INSTANCE FOR SSR!) */

  var currentPathname = history.location.pathname; // very important: used for determining address bar changes

  var HISTORY = history; // history object created via createBrowserHistory or createMemoryHistory (using history package) passed to connectTypes(routesDict, history)
  var ROUTES_DICT = routes; // {HOME: '/home', INFO: '/info/:param'} -- our route "constants" defined by our user (typically in configureStore.js)
  var ROUTE_NAMES = Object.keys(ROUTES_DICT); // ['HOME', 'INFO', 'ETC']
  var ROUTES = (0, _routesDictToArray2.default)(ROUTE_NAMES, ROUTES_DICT); // ['/home', '/info/:param/', '/etc/:etc']

  var _pathToAction = (0, _pathToAction3.default)(currentPathname, ROUTES, ROUTE_NAMES),
      type = _pathToAction.type,
      payload = _pathToAction.payload;

  var INITIAL_LOCATION_STATE = {
    pathname: currentPathname,
    type: type,
    payload: payload,
    prev: {
      pathname: null,
      type: null,
      payload: null
    }
  };

  var onBackNext = options.onBackNext,
      _options$location = options.location,
      locationKey = _options$location === undefined ? 'location' : _options$location,
      titleKey = options.title;

  /** LOCATION REDUCER: */

  function locationReducer() {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : INITIAL_LOCATION_STATE;
    var action = arguments[1];

    if (ROUTES_DICT[action.type] || action.type === _actions.NOT_FOUND) {
      state = {
        pathname: action.meta.location.current.pathname,
        type: action.type,
        payload: action.payload || {},
        prev: action.meta.location.prev || state.prev
      };

      if (action.meta.location.load) {
        state.load = true;
      }

      if (action.meta.location.backNext) {
        state.backNext = true;
      }
    }

    return state;
  }

  /** MIDDLEWARE */

  function middleware(store) {
    return function (next) {
      return function (action) {
        if (action.error && (0, _isLocationAction2.default)(action)) {
          if (process.env.NODE_ENV !== 'production') {
            console.warn('pure-redux-router: location update did not dispatch as your action has an error.');
          }
        }

        // user decided to dispatch `NOT_FOUND`, so we fill in the missing location info
        else if (action.type === _actions.NOT_FOUND && !(0, _isLocationAction2.default)(action)) {
            var pathname = store.getState().location.pathname;

            action = _prepareAction(pathname, { type: _actions.NOT_FOUND, payload: action.payload || {} });
          }

          // dispatched action matches a connected type and is not already handled by `handleHistoryChanges`
          else if (ROUTES_DICT[action.type] && !(0, _isLocationAction2.default)(action)) {
              action = createMiddlewareAction(action, ROUTES_DICT, store.getState().location);
            }

        var nextAction = next(action);
        var nextState = store.getState();

        changeAddressBar(nextState);

        return nextAction;
      };
    };
  }

  /** ENHANCER */

  function enhancer(createStore) {
    return function (reducer, preloadedState, enhancer) {
      var store = createStore(reducer, preloadedState, enhancer);

      var state = store.getState();
      var location = state[locationKey];

      if (!location || !location.pathname) {
        throw new Error('[pure-redux-router] you must provide the key of the location reducer state \n          and properly assigned the location reducer to that key.');
      }

      var dispatch = store.dispatch.bind(store);
      HISTORY.listen(handleHistoryChanges.bind(null, dispatch));

      var firstAction = createHistoryAction(currentPathname, 'load');
      store.dispatch(firstAction);

      return store;
    };
  }

  /** ADDRESS BAR + BROWSER BACK/NEXT BUTTON HANDLING */

  function handleHistoryChanges(dispatch, location) {
    // insure middleware hasn't already handled location change
    if (location.pathname !== currentPathname) {
      onBackNext && onBackNext(location);
      currentPathname = location.pathname;

      var action = createHistoryAction(currentPathname);
      dispatch(action); // dispatch route type + payload as it changes via back/next buttons usage
    }
  }

  function changeAddressBar(nextState) {
    var location = nextState[locationKey];

    if (location.pathname !== currentPathname) {
      currentPathname = location.pathname;
      HISTORY.push({ pathname: currentPathname });
      changePageTitle(nextState[titleKey]);
    }
  }

  function changePageTitle(title) {
    if (typeof window !== 'undefined' && typeof title === 'string') {
      document.title = title;
    }
  }

  /** ACTION CREATORS: */

  function createMiddlewareAction(action, routesDict, location) {
    try {
      var pathname = (0, _actionToPath2.default)(action, routesDict);
      return _prepareAction(pathname, action);
    } catch (e) {
      //developer dispatched an invalid type + payload
      //preserve previous pathname to keep app stable for future correct actions that depend on it
      var _pathname = location && location.pathname || null;
      var _payload = action.payload || {};
      return _prepareAction(_pathname, { type: _actions.NOT_FOUND, payload: _payload });
    }
  }

  function createHistoryAction(pathname) {
    var kind = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'backNext';
    var routes = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : ROUTES;
    var routeNames = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : ROUTE_NAMES;

    var action = (0, _pathToAction3.default)(pathname, routes, routeNames);
    action = _prepareAction(pathname, action);
    action.meta.location[kind] = true;
    return action;
  }

  /* INTERNAL UTILITY FUNCTIONS (THEY RELY ON OUR ENCLOSED STATE) **/

  var prev = null;

  function _prepareAction(pathname, receivedAction) {
    var action = (0, _nestAction2.default)(pathname, receivedAction, prev);
    prev = _extends({}, action.meta.location.current);
    return action;
  }

  _exportedGo = function _exportedGo(pathname) {
    var routes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ROUTES;
    var routeNames = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : ROUTE_NAMES;

    return (0, _pathToAction3.default)(pathname, routes, routeNames); // only pathname arg expected in client code
  };

  //** OUR GLORIOUS RETURN TRIUMVIRATE: reducer, middleware and enhancer */

  return {
    reducer: locationReducer,
    middleware: middleware,
    enhancer: enhancer
  };
}

/** SIDE EFFECT:
 *  Client code needs a simple go to path function. `exportedGo` gets replaced with a function aware of private instance variables.
 *  NOTE: it's also used by https://github.com/celebvidy/pure-redux-router-link 's `<Link /> component.
 *  NOTE: it will not harm SSR (unless you simulate clicking links server side--and dont do that, dispatch actions instead).
*/

var _exportedGo = void 0;

function go(pathname) {
  return _exportedGo(pathname);
}