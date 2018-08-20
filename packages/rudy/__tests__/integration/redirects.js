import createTest from '../../__helpers__/createTest'

createTest('redirect before enter', {
  SECOND: {
    path: '/second',
    beforeEnter: async ({ dispatch }) => {
      await dispatch({ type: 'REDIRECTED' })
    },
    thunk() {},
  },
})

createTest('redirect after enter', {
  SECOND: {
    path: '/second',
    thunk: ({ dispatch }) => dispatch({ type: 'REDIRECTED' }),
    onComplete() {},
  },
})

createTest('redirect before enter (on firstRoute)', {
  FIRST: {
    path: '/first',
    beforeEnter: ({ dispatch }) => dispatch({ type: 'REDIRECTED' }),
    thunk() {},
  },
})

createTest('redirect after enter (on firstRoute)', {
  FIRST: {
    path: '/first',
    thunk: ({ dispatch }) => dispatch({ type: 'REDIRECTED' }),
    onComplete() {},
  },
})
