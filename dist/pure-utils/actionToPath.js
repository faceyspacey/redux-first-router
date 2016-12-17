'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.default = actionToPath;

var _pathToRegexp = require('path-to-regexp');

var _pathToRegexp2 = _interopRequireDefault(_pathToRegexp);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function actionToPath(action, routesDict) {
  if ((typeof payload === 'undefined' ? 'undefined' : _typeof(payload)) !== 'object') {
    throw new Error('payload-not-object', '\n      \'pure-redux-router\' expects the payloads of all connected types\n      to be keyed objects in order to match payload keys to path segments. \n      The payload you provided was: `' + payload + '`\n    ');
  }

  var route = routesDict[action.type];
  var path = (typeof route === 'undefined' ? 'undefined' : _typeof(route)) === 'object' ? route.path : route;
  var params = (typeof route === 'undefined' ? 'undefined' : _typeof(route)) === 'object' ? _parseParams(route, action.payload) : action.payload;

  return _pathToRegexp2.default.compile(path)(params);
}

//eg: {route: '/page/:param'}
function _parseParams(route, params) {
  if (route.capitalizedWords === true) {
    params = Object.keys(params).reduce(function (sluggifedParams, key) {
      if (typeof params[key] === 'string') {
        sluggifedParams[key] = params[key].replace(/ /g, '-').toLowerCase();
      } else if (typeof params[key] === 'number') {
        sluggifedParams[key] = params[key];
      }

      return sluggifedParams;
    }, {});
  } else if (typeof route.toPath === 'function') {
    params = Object.keys(params).reduce(function (sluggifedParams, key) {
      sluggifedParams[key] = route.toPath(params[key]);
    }, {});
  }

  return params;
}