'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.back = exports.go = undefined;

var _pathToAction2 = require('./pure-utils/pathToAction');

var _pathToAction3 = _interopRequireDefault(_pathToAction2);

var _nestAction = require('./pure-utils/nestAction');

var _nestAction2 = _interopRequireDefault(_nestAction);

var _isLocationAction = require('./pure-utils/isLocationAction');

var _isLocationAction2 = _interopRequireDefault(_isLocationAction);

var _objectValues = require('./pure-utils/objectValues');

var _objectValues2 = _interopRequireDefault(_objectValues);

var _changePageTitle = require('./pure-utils/changePageTitle');

var _changePageTitle2 = _interopRequireDefault(_changePageTitle);

var _shouldChangeAddressBar = require('./pure-utils/shouldChangeAddressBar');

var _shouldChangeAddressBar2 = _interopRequireDefault(_shouldChangeAddressBar);

var _createHistoryAction = require('./action-creators/createHistoryAction');

var _createHistoryAction2 = _interopRequireDefault(_createHistoryAction);

var _createMiddlewareAction = require('./action-creators/createMiddlewareAction');

var _createMiddlewareAction2 = _interopRequireDefault(_createMiddlewareAction);

var _createLocationReducer = require('./createLocationReducer');

var _createLocationReducer2 = _interopRequireDefault(_createLocationReducer);

var _actions = require('./actions');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

exports.default = function (history) {
  var routesMap = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  if (process.env.NODE_ENV !== 'production') {
    if (!history) {
      throw new Error('\n        [pure-redux-rouer] invalid `history` agument. Using the \'history\' package on NPM,\n        please provide a `history` object as a second parameter. The object will be the\n        return of createBrowserHistory() (or in React Native or Node: createMemoryHistory()).\n        See: https://github.com/mjackson/history');
    }
  }

  /** INTERNAL ENCLOSED STATE (PER INSTANCE FOR SSR!) */

  var currentPathname = history.location.pathname; // very important: used for comparison to determine address bar changes
  var prevLocation = { // provides previous location state in location reducer
    pathname: '',
    type: '',
    payload: {}
  };

  var HISTORY = history; // history object created via createBrowserHistory or createMemoryHistory (using history package) passed to connectTypes(routesMap, history)
  var ROUTES_MAP = routesMap; // {HOME: '/home', INFO: '/info/:param'} -- our route "constants" defined by our user (typically in configureStore.js)
  var ROUTE_NAMES = Object.keys(ROUTES_MAP); // ['HOME', 'INFO', 'ETC']
  var ROUTES = (0, _objectValues2.default)(ROUTES_MAP); // ['/home', '/info/:param/', '/etc/:etc']
  var windowDocument = (0, _changePageTitle.getDocument)(); // get plain object for window.document if server side

  var onBackNext = options.onBackNext,
      _options$location = options.location,
      locationKey = _options$location === undefined ? 'location' : _options$location,
      _options$title = options.title,
      titleKey = _options$title === undefined ? 'title' : _options$title;

  var _pathToAction = (0, _pathToAction3.default)(currentPathname, ROUTES, ROUTE_NAMES),
      type = _pathToAction.type,
      payload = _pathToAction.payload;

  var INITIAL_LOCATION_STATE = (0, _createLocationReducer.getInitialState)(currentPathname, type, payload);
  var reducer = (0, _createLocationReducer2.default)(INITIAL_LOCATION_STATE, ROUTES_MAP);

  /** MIDDLEWARE
   *  1)  dispatches actions with location info in the `meta` key by matching the received action
   *      type + payload to express style routePaths (which also results in location reducer state updating)
   *  2)  changes the address bar url and page title if the currentPathName changes, while
   *      avoiding collisions with simultaneous browser history changes
  */

  var middleware = function middleware(store) {
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
            var _action = action,
                _payload = _action.payload;


            action = (0, _nestAction2.default)(pathname, { type: _actions.NOT_FOUND, payload: _payload }, prevLocation);
            prevLocation = action.meta.location.current;
          }

          // THE MAGIC: dispatched action matches a connected type, so we generate a location-aware action and also
          // as a result update location reducer state. (ALSO NOTE: we check if the received action `isLocationAction`
          // to prevent double dispatches coinciding with browser history changes within `_handleBrowserBackNext`)
          else if (ROUTES_MAP[action.type] && !(0, _isLocationAction2.default)(action)) {
              action = (0, _createMiddlewareAction2.default)(action, ROUTES_MAP, prevLocation);
              prevLocation = action.meta.location.current;
            }

        var nextAction = next(action);
        var nextState = store.getState();

        // IMPORTANT: keep currentPathname up to date for comparison to prevent double dispatches
        // between BROWSER back/forward button usage vs middleware-generated actions
        _possiblyChangeAddressBar(nextState[locationKey], HISTORY);
        (0, _changePageTitle2.default)(windowDocument, nextState[titleKey]);

        return nextAction;
      };
    };
  };

  /** ENHANCER
   *  1)  dispatches actions with types and payload extracted from the URL pattern
   *      when the browser history changes
   *  2)  on load of the app dispatches an action corresponding to the initial url
  */

  var enhancer = function enhancer(createStore) {
    return function (reducer, preloadedState, enhancer) {
      var store = createStore(reducer, preloadedState, enhancer);

      var state = store.getState();
      var location = state[locationKey];

      if (!location || !location.pathname) {
        throw new Error('[pure-redux-router] you must provide the key of the location\n        reducer state and properly assigned the location reducer to that key.');
      }

      var dispatch = store.dispatch.bind(store);
      HISTORY.listen(_handleBrowserBackNext.bind(null, dispatch));

      // dispatch the first location-aware action
      var action = (0, _createHistoryAction2.default)(currentPathname, ROUTES, ROUTE_NAMES, prevLocation, 'load');
      prevLocation = action.meta.location.current;
      store.dispatch(action);

      return store;
    };
  };

  /* INTERNAL UTILITY FUNCTIONS (THEY ARE IN THIS FILE BECAUSE THEY RELY ON OUR ENCLOSED STATE) **/

  var _handleBrowserBackNext = function _handleBrowserBackNext(dispatch, location) {
    if (location.pathname !== currentPathname) {
      // insure middleware hasn't already handled location change
      if (typeof onBackNext === 'function') {
        onBackNext(location);
      }

      var action = (0, _createHistoryAction2.default)(location.pathname, ROUTES, ROUTE_NAMES, prevLocation, 'backNext');

      prevLocation = action.meta.location.current;
      currentPathname = location.pathname;

      dispatch(action); // dispatch route type + payload as it changes via back/next buttons usage
    }
  };

  var _possiblyChangeAddressBar = function _possiblyChangeAddressBar(locationState, history) {
    if ((0, _shouldChangeAddressBar2.default)(locationState, currentPathname)) {
      currentPathname = locationState.pathname;
      history.push({ pathname: currentPathname });
    }
  };

  _exportedGo = function _exportedGo(pathname) {
    return (0, _pathToAction3.default)(pathname, ROUTES, ROUTE_NAMES);
  }; // only pathname arg expected in client code

  _history = HISTORY;

  /* RETURN TRIUMVERATE */

  return {
    reducer: reducer,
    middleware: middleware,
    enhancer: enhancer,

    // returned only for tests (not for use in application code)
    _possiblyChangeAddressBar: _possiblyChangeAddressBar,
    _handleBrowserBackNext: _handleBrowserBackNext,
    _exportedGo: _exportedGo,
    windowDocument: windowDocument,
    history: history
  };
};

/** SIDE EFFECT:
 *  Client code needs a simple go to path action creator.
 *  `exportedGo` gets replaced with a function aware of private instance variables.
 *  NOTE: it's primarily for use by https://github.com/celebvidy/pure-redux-router-link 's `<Link /> component.
 *
 *  NOTE: it will not harm SSR, so long as you don't use it server side. So that means DO NOT
 *  simulate clicking links server side--and dont do that, dispatch actions instead).
*/

var _exportedGo = void 0;
var _history = void 0;

var go = exports.go = function go(pathname) {
  return _exportedGo(pathname);
};

/** SIDE EFFECT:
 *  it's only recommended you use `back` when prototyping--it's better to use the above mentioned <Link />
 *  component to generate SEO friendly urls with hrefs pointing to the previous URL. You can
 *  use your redux state to determine the previous URL. The location reducer will also contain the info.
 *  But if you must, this is here for convenience and it basically simulates the user pressing the browser
 *  back button, which of course the system picks up and parses into an action.
 */

var back = exports.back = function back() {
  return _history.goBack();
};