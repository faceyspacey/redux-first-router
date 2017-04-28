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

    tests: ['__tests__/**/*.js'],

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
