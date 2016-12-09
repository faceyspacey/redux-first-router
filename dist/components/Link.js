'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRedux = require('react-redux');

var _connectTypes = require('../connectTypes');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function Link(_ref) {
  var href = _ref.href,
      children = _ref.children,
      onPress = _ref.onPress,
      _ref$down = _ref.down,
      down = _ref$down === undefined ? false : _ref$down,
      _ref$shouldDispatch = _ref.shouldDispatch,
      shouldDispatch = _ref$shouldDispatch === undefined ? true : _ref$shouldDispatch,
      target = _ref.target,
      dispatch = _ref.dispatch,
      props = _objectWithoutProperties(_ref, ['href', 'children', 'onPress', 'down', 'shouldDispatch', 'target', 'dispatch']);

  var handler = handlePress.bind(null, href, onPress, shouldDispatch, target, dispatch);

  return _react2.default.createElement(
    'a',
    _extends({
      href: href,
      onClick: !down && handler || preventDefault,
      onMouseDown: down && handler,
      onTouchStart: down && handler,
      target: target
    }, props),
    children
  );
}

exports.default = (0, _reactRedux.connect)()(Link);


function handlePress(href, onPress, shouldDispatch, target, dispatch, e) {
  if (target !== '_blank') {
    e.preventDefault();
  }

  var shouldGo = true;

  if (onPress) {
    shouldGo = onPress(e); //onPress can return false to prevent dispatch
    shouldGo = typeof shouldGo === 'undefined' ? true : shouldGo;
  }

  if (shouldGo && shouldDispatch && target !== '_blank') {
    dispatch((0, _connectTypes.go)(href));
  }
}

function preventDefault(e) {
  e.preventDefault();
}