const path = require('path')

function res() {
  const segments = Array.from(arguments)
  segments.unshift(__dirname)
  return path.join.apply(undefined, segments)
}

module.exports = {
  extends: [res('../../.eslintrc.js')],
  rules: {
    'no-param-reassign': 0,
  },
}

/*
const original = {
  parser: 'babel-eslint',
  parserOptions: {
    ecmaFeatures: {
      generators: true,
      experimentalObjectRestSpread: true
    },
    sourceType: 'module',
    allowImportExportEverywhere: false
  },
  plugins: ['flowtype'],
  extends: ['airbnb', 'plugin:flowtype/recommended'],
  settings: {
    flowtype: {
      onlyFilesWithFlowAnnotation: true
    },
    'import/resolver': {
      node: {
        extensions: ['.js', '.json', '.css', '.styl']
      }
    }
  },
  globals: {
    window: true,
    document: true,
    __dirname: true,
    __DEV__: true,
    CONFIG: true,
    process: true,
    jest: true,
    describe: true,
    test: true,
    it: true,
    expect: true,
    beforeEach: true,
    beforeAll: true,
    jestUtils: true,
    log: true
  },
  // 'import/resolver': {
  //   node: {
  //     extensions: ['.js', '.css', '.json', '.styl']
  //   }
  // },
  rules: {
    'import/extensions': [
      'error',
      'always',
      {
        js: 'never',
        jsx: 'never',
        styl: 'never',
        css: 'never'
      }
    ],
    'import/ignore': ['node_modules', 'flow-typed', '\\.(css|styl|svg|json)$'],
    'no-shadow': 0,
    'no-use-before-define': 0,
    'no-param-reassign': 0,
    'react/prop-types': 0,
    'react/no-render-return-value': 0,
    'no-confusing-arrow': 0,
    'no-underscore-dangle': 0,
    'no-plusplus': 0,
    camelcase: 1,
    'prefer-template': 1,
    'react/no-array-index-key': 1,
    'global-require': 1,
    'react/jsx-indent': 1,
    'dot-notation': 1,
    'import/no-named-default': 1,
    'no-unused-vars': 1,
    'import/no-unresolved': 1,
    'flowtype/no-weak-types': 1,
    'consistent-return': 0,
    'no-nested-ternary': 0,
    'no-empty': 0,
    'no-cond-assign': 0,
    'no-return-assign': 1,
    'no-continue': 1,
    'arrow-body-style': 1,
    'no-console': 1,
    'no-return-await': 1,
    'no-multi-assign': 1,
    'guard-for-in': 1,
    'jsx-a11y/aria-props': 1,
    'no-await-in-loop': 1,
    'prefer-destructuring': 1,
    'no-return-assign': 0,
    'no-multi-assign': 0,
    'space-before-function-paren': 0,
    'guard-for-in': 0,
    'no-restricted-syntax': 0,
    'class-methods-use-this': 0,
    'object-curly-newline': 0,
    'object-shorthand': 0,
    semi: [2, 'never'],
    'no-multi-spaces': [2, { ignoreEOLComments: true }],
    'flowtype/semi': [2, 'never'],
    'jsx-quotes': [2, 'prefer-single'],
    'react/jsx-filename-extension': [2, { extensions: ['.jsx', '.js'] }],
    'spaced-comment': [2, 'always', { markers: ['?'] }],
    'arrow-parens': [0, 'as-needed', { requireForBlockBody: false }],
    'brace-style': [2, 'stroustrup'],
    'no-unused-expressions': [
      2,
      {
        allowShortCircuit: true,
        allowTernary: true,
        allowTaggedTemplates: true
      }
    ],
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: true,
        optionalDependencies: true,
        peerDependencies: true
      }
    ],
    'comma-dangle': [
      2,
      {
        arrays: 'never',
        objects: 'never',
        imports: 'never',
        exports: 'never',
        functions: 'never'
      }
    ],
    'max-len': [
      'error',
      {
        code: 86,
        tabWidth: 2,
        ignoreUrls: true,
        ignoreComments: true,
        ignoreRegExpLiterals: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true
      }
    ],
    'react/sort-comp': [
      1,
      {
        order: [
          'propTypes',
          'props',
          'state',
          'defaultProps',
          'contextTypes',
          'childContextTypes',
          'getChildContext',
          'static-methods',
          'lifecycle',
          'everything-else',
          'render'
        ]
      }
    ]
  }
}
*/
