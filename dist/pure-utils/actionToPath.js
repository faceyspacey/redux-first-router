'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _pathToRegexp = require('path-to-regexp');

var _pathToRegexp2 = _interopRequireDefault(_pathToRegexp);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (action, routesMap) {
  var route = routesMap[action.type];
  var path = (typeof route === 'undefined' ? 'undefined' : _typeof(route)) === 'object' ? route.path : route;
  var params = (typeof route === 'undefined' ? 'undefined' : _typeof(route)) === 'object' ? _payloadToParams(route, action.payload) : action.payload;

  return _pathToRegexp2.default.compile(path)(params || {});
};

var _payloadToParams = function _payloadToParams(route) {
  var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  return Object.keys(params).reduce(function (sluggifedParams, key) {
    if (typeof params[key] !== 'undefined') {
      if (typeof params[key] === 'number') {
        sluggifedParams[key] = params[key];
      } else if (route.capitalizedWords === true) {
        sluggifedParams[key] = params[key].replace(/ /g, '-').toLowerCase();
      } else if (typeof route.toPath === 'function') {
        sluggifedParams[key] = route.toPath(params[key], key);
      } else if (typeof params[key] === 'string') {
        sluggifedParams[key] = params[key];
      }
    }

    return sluggifedParams;
  }, {});
};