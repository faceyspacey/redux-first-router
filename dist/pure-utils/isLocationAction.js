"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (action) {
  return action.meta && action.meta.location;
};