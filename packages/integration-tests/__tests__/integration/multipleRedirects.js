import createTest from '../../__helpers__/createTest'

createTest('multiple redirects are honored', {
  SECOND: {
    path: '/second',
    beforeEnter: ({ dispatch }) => dispatch({ type: 'REDIRECTED' }),
    thunk() {},
  },
  REDIRECTED: {
    path: '/redirected',
    beforeEnter: ({ dispatch }) => dispatch({ type: 'REDIRECTED_AGAIN' }),
    thunk() {},
  },
  REDIRECTED_AGAIN: {
    path: '/redirected-again',
    thunk() {},
  },
})

createTest('multiple redirects are honored after enter', {
  SECOND: {
    path: '/second',
    thunk: ({ dispatch }) => dispatch({ type: 'REDIRECTED_AFTER' }),
    onComplete() {},
  },
  REDIRECTED_AFTER: {
    path: '/redirected-after',
    thunk: ({ dispatch }) => dispatch({ type: 'REDIRECTED_AGAIN_AFTER' }),
    onComplete() {},
  },
  REDIRECTED_AGAIN_AFTER: {
    path: '/redirected-again-after',
    onComplete() {},
  },
})
