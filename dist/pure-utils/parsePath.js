'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.default = parsePath;

var _pathToRegexp = require('path-to-regexp');

var _pathToRegexp2 = _interopRequireDefault(_pathToRegexp);

var _actionCreators = require('../actionCreators');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function parsePath(pathname, routes, routeNames) {
  var i = 0;
  var match = void 0;
  var keys = [];

  while (!match && i < routes.length) {
    keys.length = 0; //empty the array and start over
    var routePath = routes[i].path || routes[i]; //route may be an object containing a route or a route string itself
    var reg = (0, _pathToRegexp2.default)(routePath, keys);
    match = reg.exec(pathname);
    i++;
  }

  if (match) {
    var _ret = function () {
      i--;
      var route = routeNames[i];
      var capitalizedWords = routes[i] && routes[i].capitalizedWords;
      var fromPath = routes[i] && typeof routes[i].fromPath === 'function';

      var params = keys.reduce(function (params, key, index) {
        var value = match[index + 1]; //item at index 0 is the overall match, whereas those after correspond to the key's index

        value = !isNaN(value) ? parseFloat(value) : value; //make sure pure numbers aren't passed to reducers as strings
        value = capitalizedWords && typeof value === 'string' ? value.replace(/-/g, ' ').replace(/\b\w/g, function (l) {
          return l.toUpperCase();
        }) : value; // 'my-category' -> 'My Category' 
        value = fromPath ? fromPath(value) : value;

        params[key.name] = value;

        return params;
      }, {});

      return {
        v: { type: route, payload: params }
      };
    }();

    if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
  } else {
    //This will basically will only end up being called if the developer is manually calling history.push().
    //Or, if visitors visit an invalid URL, the developer can use the NOT_FOUND type to show a not-found page to
    return { type: _actionCreators.NOT_FOUND, payload: {} };
  }
}