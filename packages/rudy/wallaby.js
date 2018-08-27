const config = require('./.testsConfig.json')

module.exports = (wallaby) => {
  process.env.NODE_ENV = 'test'
  process.env.RUDY_OPTIONS = JSON.stringify(config)
  process.env.WALLABY = true

  return {
    files: [
      { pattern: 'src/**/*.js', load: false },
      { pattern: 'package.json', load: false },
      { pattern: '__tests__/**/*.snap', load: false },
      { pattern: '__helpers__/**/*.js', load: false },
      { pattern: '__test-helpers__/**/*.js', load: false },
    ],

    filesWithNoCoverageCalculated: [
      '__helpers__/**/*.js',
      '__test-helpers__/**/*.js',
      'src/history/BrowserHistory.js',
      'src/history/utils/sessionStorage.js',
    ],

    tests: [
      // '__tests__/integration/browser/pop/popCancelsAction.js',
      // '__tests__/integration/browser/sessionStorage/restoreFromMiddle.js',
      // '__tests__/integration/browser/pop/redirectToCurrent.js',
      // '__tests__/integration/browser/pop/redirect.js',
      // '__tests__/integration/browser/pop/**/*.js',
      // '__tests__/integration/browser/sessionStorage/historyFallback.js',
      // '__tests__/integration/redirects.js',

      // '__tests__/integration/browser/history/replace.js',
      // '__tests__/integration/browser/history/**/*.js',

      // '__tests__/integration/browser/**/*.js',
      // '__tests__/integration/actions/**/*.js',
      // '__tests__/integration/createScene/**/*.js',

      // '__tests__/integration/browser/pop/**/*.js',
      // '__tests__/integration/browser/sessionStorage/**/*.js',

      // '__tests__/integration/actions/addRoutes.js',
      // '__tests__/integration/actions/changeBasename.js',
      // '__tests__/integration/actions/notFound.js',
      // '__tests__/integration/actions/redirect.js',
      // '__tests__/integration/actions/history.js',

      // '__tests__/integration/createScene/actionCreators.js',
      // '__tests__/integration/createScene/options.js',
      // '__tests__/integration/createScene/returnedUtilities.js',

      // '__tests__/integration/params.js',
      // '__tests__/integration/queries.js',
      // '__tests__/integration/hashes.js',
      // '__tests__/integration/entryState.js',

      // '__tests__/integration/arrayCallback.js',
      // '__tests__/integration/inheritedCallbacks.js',

      // '__tests__/integration/anonymousThunk.js',
      // '__tests__/integration/pathlessRoute.js',

      // '__tests__/integration/autoDispatch.js',
      // '__tests__/integration/autoDispatchFalse.js',

      // '__tests__/integration/formatRoutes.js',
      // '__tests__/integration/callRoute.js',

      // '__tests__/integration/cancelPendingRequest.js',
      // '__tests__/integration/dontDoubleDispatch.js',

      // '__tests__/integration/createAction.js',
      // '__tests__/integration/createRequest.js',

      // '__tests__/integration/firstRoute.js',
      // '__tests__/integration/SPA.js',
      // '__tests__/integration/hydrate.js',

      // '__tests__/integration/middlewareAsFunction.js',
      // '__tests__/integration/routeLevelMiddleware.js',
      // '__tests__/integration/callStartTrue.js',

      // '__tests__/integration/async.js',
      // '__tests__/integration/onError.js',
      // '__tests__/integration/optionsCallbacks.js',
      // '__tests__/integration/overrideOptionse.js',
      // '__tests__/integration/thunkCaching.js',

      // '__tests__/integration/redirects.js',
      // '__tests__/integration/returnFalse.js',
      // '__tests__/integration/multipleRedirects.js',
      // '__tests__/integration/complexRedirects.js',
      // '__tests__/integration/serverRedirect.js',
      // '__tests__/integration/redirectShortcut.js',
      // '__tests__/integration/dispatchFrom.js',

      // '__tests__/integration/uninheritedHistory.js',
      // '__tests__/integration/browser/actionsInCallbacks/set.js',
      // '__tests__/integration/browser/history/set.js',
      '__tests__/integration/actions/history.js',
      // '__tests__/integration/browser/actionsInCallbacks/resetOnLoad.js',
    ],

    env: {
      type: 'node',
      runner: 'node',
    },

    testFramework: 'jest',
    compilers: {
      '**/*.js': wallaby.compilers.babel({ babelrc: true }),
    },
    setup(wallaby) {
      const conf = require('./package.json').jest
      wallaby.testFramework.configure(conf)
    },
    // runAllTestsInAffectedTestFile: true,
    // runAllTestsInAffectedTestGroup: true,
    debug: false,
  }
}
