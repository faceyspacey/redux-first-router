'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = function (pathname, receivedAction, prev, kind) {
  var type = receivedAction.type,
      _receivedAction$paylo = receivedAction.payload,
      payload = _receivedAction$paylo === undefined ? {} : _receivedAction$paylo,
      meta = receivedAction.meta;


  return {
    type: type,
    payload: payload,
    meta: _extends({}, meta, {
      location: {
        current: {
          pathname: pathname,
          type: type,
          payload: payload
        },
        prev: prev,
        load: kind === 'load' ? true : undefined,
        backNext: kind === 'backNext' ? true : undefined
      }
    })
  };
};