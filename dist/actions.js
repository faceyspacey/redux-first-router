'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _connectTypes = require('./connectTypes');

Object.defineProperty(exports, 'go', {
  enumerable: true,
  get: function get() {
    return _connectTypes.go;
  }
});
var NOT_FOUND = exports.NOT_FOUND = '@@address-bar/NOT_FOUND';

/** PRIMARY/SOLE NAVIGATION ACTION CREATOR 
 *  note: on web most of the time you want to use a link component that embeds an `<a />` element
 *  to the DOM for SEO purposes. See our small `<Link />`component:
 *  https://github.com/celebvidy/pure-redux-router-link
*/