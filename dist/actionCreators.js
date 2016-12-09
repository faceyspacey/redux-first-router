'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.init = init;
exports.initThunk = initThunk;
var INIT = exports.INIT = '@@address-bar/INIT'; //used internally by middleware and then action is re-written
var NOT_FOUND = exports.NOT_FOUND = '@@address-bar/NOT_FOUND';

/** EXPORTED INIT ACTION CREATORS: 
 *  for use when ready key is not provided and 
 *  manual control of initialization is desired
*/

function init(pathname) {
  return {
    type: INIT,
    payload: {
      pathname: pathname
    }
  };
}

function initThunk() {
  return function (dispatch, getState) {
    var pathname = getState().location.pathname;

    return dispatch(init(pathname));
  };
}