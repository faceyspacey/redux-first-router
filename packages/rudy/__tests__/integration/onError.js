import createTest from '../../__helpers__/createTest'

createTest('route onError called if other callbacks throw', {
  SECOND: {
    path: '/second',
    thunk: () => {
      throw new Error('thunk-failed')
    },
    onError() {},
  },
})

createTest('route onError dispatches redirect', {
  SECOND: {
    path: '/second',
    thunk: () => {
      throw new Error('thunk-failed')
    },
    onError: () => ({ type: 'REDIRECTED' }),
  },
})

createTest('currentType_ERROR dispatched if no onError callback provided', {
  SECOND: {
    path: '/second',
    thunk: () => {
      throw new Error('thunk-failed')
    },
  },
})

createTest(
  'default options.onError skipped if options.onError === null',
  {
    SECOND: {
      path: '/second',
      thunk: () => {
        throw new Error('thunk-failed')
      },
      onError() {},
    },
  },
  { onError: null },
)
