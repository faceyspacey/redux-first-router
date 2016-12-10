'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.default = formatParams;
function formatParams(route, params) {
  var routePath = void 0;

  if ((typeof route === 'undefined' ? 'undefined' : _typeof(route)) === 'object') {
    //eg: {route: '/page/:param'}
    routePath = route.path;

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
  } else {
    routePath = route;
  }

  return { routePath: routePath, params: params }; //eg: '/page/:param'
}