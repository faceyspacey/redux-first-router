"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = routesDictToArray;
function routesDictToArray(routeNames, routes) {
  return routeNames.reduce(function (routesArray, key) {
    routesArray.push(routes[key]);
    return routesArray;
  }, []);
}