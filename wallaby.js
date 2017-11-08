module.exports = wallaby => {
  process.env.NODE_ENV = 'test'

  return {
    files: [
      { pattern: 'src/**/*.js', load: false },
      { pattern: 'package.json', load: false },
      { pattern: '__tests__/**/*.snap', load: false },
      { pattern: '__test-helpers__/**/*.js', load: false }
    ],

    filesWithNoCoverageCalculated: ['__test-helpers__/**/*.js'],

    tests: [
      '__tests__/beforeEnter.js',
      '__tests__/beforeLeave.js',
      '__tests__/onComplete.js',
      '__tests__/onEnter.js',
      '__tests__/onLeave.js',
      '__tests__/thunk.js',

      '__tests__/middleware.js',
      '__tests__/enhancer.js',

      '__tests__/createRouter.js',

      '__tests__/actionToPath.js',
      '__tests__/pathToaction.js',
      '__tests__/queryStrings.js',
      '__tests__/action-creators.js',
      '__tests__/utils.js',

      '__tests__/nestAction.js',
      '__tests__/history.js',
      '__tests__/createLocationReducer.js',
      '__tests__/reducer.js',
      '__tests__/clientOnlyApi.js'
    ],

    env: {
      type: 'node',
      runner: 'node'
    },

    testFramework: 'jest',
    compilers: {
      '**/*.js': wallaby.compilers.babel({ babelrc: true })
    },
    setup(wallaby) {
      const conf = require('./package.json').jest
      wallaby.testFramework.configure(conf)
    },
    // runAllTestsInAffectedTestFile: true,
    // runAllTestsInAffectedTestGroup: true,
    debug: false
  }
}
