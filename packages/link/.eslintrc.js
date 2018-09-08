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
  env: {
    browser: true,
  },
}
