webpackJsonp([1, 2], {
  /***/ 29: /***/ function(module, exports, __webpack_require__) {
    'use strict'
    eval(
      "\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\n\nvar _react = __webpack_require__(6);\n\nvar _react2 = _interopRequireDefault(_react);\n\nvar _App = __webpack_require__(101);\n\nvar _App2 = _interopRequireDefault(_App);\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }\n\nvar _default = function _default(_ref) {\n  var title = _ref.title,\n      text = _ref.text,\n      url = _ref.url;\n  return _react2.default.createElement(\n    'div',\n    null,\n    _react2.default.createElement(\n      'div',\n      { className: _App2.default.more },\n      title\n    ),\n    _react2.default.createElement(\n      'a',\n      {\n        className: _App2.default.link,\n        href: url,\n        target: '_blank',\n        rel: 'noopener noreferrer'\n      },\n      text\n    )\n  );\n};\n\nexports.default = _default;\n;\n\nvar _temp = function () {\n  if (typeof __REACT_HOT_LOADER__ === 'undefined') {\n    return;\n  }\n\n  __REACT_HOT_LOADER__.register(_default, 'default', '/Users/jamesgillmore/React/redux-first-router/examples/boilerplate/src/components/ArticlePromotion.js');\n}();\n\n;\n\n//////////////////\n// WEBPACK FOOTER\n// ./src/components/ArticlePromotion.js\n// module id = 29\n// module chunks = 0 1 2\n\n//# sourceURL=webpack:///./src/components/ArticlePromotion.js?"
    )

    /***/
  },

  /***/ 32: /***/ function(module, exports, __webpack_require__) {
    'use strict'
    eval(
      "\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\n\nvar _react = __webpack_require__(6);\n\nvar _react2 = _interopRequireDefault(_react);\n\nvar _ArticlePromotion = __webpack_require__(29);\n\nvar _ArticlePromotion2 = _interopRequireDefault(_ArticlePromotion);\n\nvar _Home = __webpack_require__(342);\n\nvar _Home2 = _interopRequireDefault(_Home);\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }\n\nvar Home = function Home() {\n  return _react2.default.createElement(\n    'div',\n    { className: _Home2.default.home },\n    _react2.default.createElement(\n      'h1',\n      { className: _Home2.default.title },\n      'HOME'\n    ),\n    _react2.default.createElement(\n      'div',\n      { className: _Home2.default.content },\n      _react2.default.createElement('img', {\n        alt: 'logo',\n        style: { height: 300 },\n        src: 'https://cdn.reactlandia.com/rudy-logo.png'\n      }),\n      _react2.default.createElement(\n        'span',\n        { className: _Home2.default.caption },\n        'RFR will become Rudy'\n      ),\n      _react2.default.createElement(_ArticlePromotion2.default, {\n        title: 'Wanna master SSR? Read:',\n        text: 'Server-Render Like a Pro in 10 Steps /w Redux-First Router \\uD83D\\uDE80',\n        url: 'https://medium.com/faceyspacey/server-render-like-a-pro-w-redux-first-router-in-10-steps-b27dd93859de'\n      })\n    ),\n    _react2.default.createElement(\n      'a',\n      {\n        target: '_blank',\n        className: _Home2.default.nico,\n        rel: 'noopener noreferrer',\n        href: 'https://twitter.com/nico__delfino'\n      },\n      '*One of our first users, Nicolas Delfino, designed the logo, check him out: @nico__delfino'\n    )\n  );\n};\n\nvar _default = Home;\nexports.default = _default;\n;\n\nvar _temp = function () {\n  if (typeof __REACT_HOT_LOADER__ === 'undefined') {\n    return;\n  }\n\n  __REACT_HOT_LOADER__.register(Home, 'Home', '/Users/jamesgillmore/React/redux-first-router/examples/boilerplate/src/components/Home.js');\n\n  __REACT_HOT_LOADER__.register(_default, 'default', '/Users/jamesgillmore/React/redux-first-router/examples/boilerplate/src/components/Home.js');\n}();\n\n;\n\n//////////////////\n// WEBPACK FOOTER\n// ./src/components/Home.js\n// module id = 32\n// module chunks = 1\n\n//# sourceURL=webpack:///./src/components/Home.js?"
    )

    /***/
  },

  /***/ 342: /***/ function(module, exports, __webpack_require__) {
    eval(
      '// removed by extract-text-webpack-plugin\nmodule.exports = {"home":"Home__home--hWrjv","title":"Home__title--33IGt","content":"Home__content--319uD","caption":"Home__caption--1IeKt","nico":"Home__nico--37MtL"};\nif (true) {\n\tmodule.hot.accept();\n\tif (module.hot.data) {\n\t\tvar neverUsed = 1519612155476\n\t\t__webpack_require__(30)("/static/", "Home.css");\n\t}\n}\n\n//////////////////\n// WEBPACK FOOTER\n// ./src/css/Home.css\n// module id = 342\n// module chunks = 1\n\n//# sourceURL=webpack:///./src/css/Home.css?'
    )

    /***/
  }
})
