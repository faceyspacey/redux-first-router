'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _pathToRegexp = require('path-to-regexp');

var _pathToRegexp2 = _interopRequireDefault(_pathToRegexp);

var _actions = require('../actions');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (path, routes, routeNames) {
  var i = 0;
  var match = void 0;
  var keys = [];

  while (!match && i < routes.length) {
    keys.length = 0; // empty the array and start over
    var routePath = routes[i].path || routes[i]; // route may be an object containing a route or a route string itself
    var reg = (0, _pathToRegexp2.default)(routePath, keys);
    match = reg.exec(path);
    i++;
  }

  if (match) {
    var _ret = function () {
      i--;

      var capitalizedWords = _typeof(routes[i]) === 'object' && routes[i].capitalizedWords;
      var fromPath = routes[i] && typeof routes[i].fromPath === 'function' && routes[i].fromPath;
      var type = routeNames[i];

      var payload = keys.reduce(function (payload, key, index) {
        var value = match && match[index + 1]; // item at index 0 is the overall match, whereas those after correspond to the key's index

        value = !isNaN(value) ? parseFloat(value) // make sure pure numbers aren't passed to reducers as strings
        : value;

        value = capitalizedWords && typeof value === 'string' ? value.replace(/-/g, ' ').replace(/\b\w/g, function (l) {
          return l.toUpperCase();
        }) // 'my-category' -> 'My Category'
        : value;

        value = fromPath && typeof value === 'string' ? fromPath(value, key.name) : value;

        payload[key.name] = value;

        return payload;
      }, {});

      return {
        v: { type: type, payload: payload }
      };
    }();

    if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
  }

  // This will basically will only end up being called if the developer is manually calling history.push().
  // Or, if visitors visit an invalid URL, the developer can use the NOT_FOUND type to show a not-found page to
  return { type: _actions.NOT_FOUND, payload: {} };
};