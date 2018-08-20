module.exports = {
  extends: [
    'eslint-config-airbnb',
    'plugin:prettier/recommended',
    'prettier/flowtype',
    'prettier/react',
  ],
  parser: 'babel-eslint',
  rules: {
    'prettier/prettier': 'warn',
    'no-use-before-define': ['error', { functions: false, classes: false, variables: false }],
  },
}
