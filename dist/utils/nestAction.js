"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = nestAction;
function nestAction(pathname, receivedAction, prev) {
  var type = receivedAction.type,
      payload = receivedAction.payload,
      meta = receivedAction.meta;


  return {
    type: type,
    payload: payload,
    meta: meta,
    location: {
      current: {
        pathname: pathname,
        type: type,
        payload: payload
      },
      prev: prev
    }
  };
}