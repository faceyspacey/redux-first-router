webpackJsonp([0, 2], {
  /***/ 29: /***/ function(module, exports, __webpack_require__) {
    'use strict'
    eval(
      "\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\n\nvar _react = __webpack_require__(6);\n\nvar _react2 = _interopRequireDefault(_react);\n\nvar _App = __webpack_require__(101);\n\nvar _App2 = _interopRequireDefault(_App);\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }\n\nvar _default = function _default(_ref) {\n  var title = _ref.title,\n      text = _ref.text,\n      url = _ref.url;\n  return _react2.default.createElement(\n    'div',\n    null,\n    _react2.default.createElement(\n      'div',\n      { className: _App2.default.more },\n      title\n    ),\n    _react2.default.createElement(\n      'a',\n      {\n        className: _App2.default.link,\n        href: url,\n        target: '_blank',\n        rel: 'noopener noreferrer'\n      },\n      text\n    )\n  );\n};\n\nexports.default = _default;\n;\n\nvar _temp = function () {\n  if (typeof __REACT_HOT_LOADER__ === 'undefined') {\n    return;\n  }\n\n  __REACT_HOT_LOADER__.register(_default, 'default', '/Users/jamesgillmore/React/redux-first-router/examples/boilerplate/src/components/ArticlePromotion.js');\n}();\n\n;\n\n//////////////////\n// WEBPACK FOOTER\n// ./src/components/ArticlePromotion.js\n// module id = 29\n// module chunks = 0 1 2\n\n//# sourceURL=webpack:///./src/components/ArticlePromotion.js?"
    )

    /***/
  },

  /***/ 33: /***/ function(module, exports, __webpack_require__) {
    'use strict'
    eval(
      "\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\n\nvar _react = __webpack_require__(6);\n\nvar _react2 = _interopRequireDefault(_react);\n\nvar _reactRedux = __webpack_require__(31);\n\nvar _ArticlePromotion = __webpack_require__(29);\n\nvar _ArticlePromotion2 = _interopRequireDefault(_ArticlePromotion);\n\nvar _List = __webpack_require__(343);\n\nvar _List2 = _interopRequireDefault(_List);\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }\n\nvar List = function List(_ref) {\n  var category = _ref.category,\n      packages = _ref.packages;\n  return _react2.default.createElement(\n    'div',\n    { className: _List2.default.list },\n    _react2.default.createElement(\n      'div',\n      { className: _List2.default.title },\n      'Category: ',\n      category\n    ),\n    _react2.default.createElement(\n      'div',\n      { className: _List2.default.content },\n      _react2.default.createElement(\n        'ul',\n        null,\n        packages.map(function (pkg) {\n          return _react2.default.createElement(\n            'li',\n            { key: pkg },\n            pkg\n          );\n        })\n      ),\n      category === 'redux' ? _react2.default.createElement(_ArticlePromotion2.default, {\n        title: 'Wanna master data-fetching? Read:',\n        text: 'Redux-First Router data-fetching: solving the 80% use case for async Middleware \\uD83D\\uDE80',\n        url: 'https://medium.com/faceyspacey/redux-first-router-data-fetching-solving-the-80-use-case-for-async-middleware-14529606c262'\n      }) : _react2.default.createElement(_ArticlePromotion2.default, {\n        title: 'New to Rudy?? Learn how it started and its motivation:',\n        text: 'Pre Release: Redux-First Router\\u200A\\u2014\\u200AA Step Beyond Redux-Little-Router \\uD83D\\uDE80',\n        url: 'https://medium.com/faceyspacey/pre-release-redux-first-router-a-step-beyond-redux-little-router-cd2716576aea'\n      })\n    )\n  );\n};\n\nvar mapStateToProps = function mapStateToProps(state) {\n  return {\n    category: state.category,\n    packages: state.packages\n  };\n};\n\nvar _default = (0, _reactRedux.connect)(mapStateToProps)(List);\n\nexports.default = _default;\n;\n\nvar _temp = function () {\n  if (typeof __REACT_HOT_LOADER__ === 'undefined') {\n    return;\n  }\n\n  __REACT_HOT_LOADER__.register(List, 'List', '/Users/jamesgillmore/React/redux-first-router/examples/boilerplate/src/components/List.js');\n\n  __REACT_HOT_LOADER__.register(mapStateToProps, 'mapStateToProps', '/Users/jamesgillmore/React/redux-first-router/examples/boilerplate/src/components/List.js');\n\n  __REACT_HOT_LOADER__.register(_default, 'default', '/Users/jamesgillmore/React/redux-first-router/examples/boilerplate/src/components/List.js');\n}();\n\n;\n\n//////////////////\n// WEBPACK FOOTER\n// ./src/components/List.js\n// module id = 33\n// module chunks = 0\n\n//# sourceURL=webpack:///./src/components/List.js?"
    )

    /***/
  },

  /***/ 343: /***/ function(module, exports, __webpack_require__) {
    eval(
      '// removed by extract-text-webpack-plugin\nmodule.exports = {"list":"List__list--1UmSB","title":"List__title--Em6wI","content":"List__content---DW7D"};\nif (true) {\n\tmodule.hot.accept();\n\tif (module.hot.data) {\n\t\tvar neverUsed = 1519612155486\n\t\t__webpack_require__(30)("/static/", "List.css");\n\t}\n}\n\n//////////////////\n// WEBPACK FOOTER\n// ./src/css/List.css\n// module id = 343\n// module chunks = 0\n\n//# sourceURL=webpack:///./src/css/List.css?'
    )

    /***/
  }
})
