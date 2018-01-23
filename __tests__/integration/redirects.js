import createTest from '../../__helpers__/createTest'

createTest('redirect before enter', {
  SECOND: {
    path: '/second',
    beforeEnter: ({ dispatch }) => {
      dispatch({ type: 'REDIRECTED' })
    },
    thunk: function() {}
  }
})

createTest('redirect after enter', {
  SECOND: {
    path: '/second',
    thunk: jest.fn(({ dispatch }) => {
      dispatch({ type: 'REDIRECTED' })
    }),
    onComplete: jest.fn()
  }
})

createTest('redirect before enter (on firstRoute)', {
  FIRST: {
    path: '/first',
    beforeEnter: ({ dispatch }) => {
      dispatch({ type: 'REDIRECTED' })
    },
    thunk: function() {}
  }
})

createTest('redirect after enter (on firstRoute)', {
  FIRST: {
    path: '/first',
    thunk: ({ dispatch }) => {
      dispatch({ type: 'REDIRECTED' })
    },
    onComplete: function() {}
  }
})
