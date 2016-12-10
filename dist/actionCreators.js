'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.init = init;
exports.initThunk = initThunk;

var _connectTypes = require('./connectTypes');

Object.defineProperty(exports, 'go', {
  enumerable: true,
  get: function get() {
    return _connectTypes.go;
  }
});
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

/** PRIMARY/SOLE NAVIGATION ACTION CREATOR 
 *  note: on web most of the time you want to use a link component that embeds an `<a />` element
 *  to the DOM for SEO purposes. See our small `<Link />`component:
 *  https://github.com/celebvidy/pure-redux-router-link
*/