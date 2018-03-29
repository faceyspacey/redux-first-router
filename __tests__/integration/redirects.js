import createTest from '../../__helpers__/createTest'

createTest('redirect before enter', {
  SECOND: {
    path: '/second',
    beforeEnter: async ({ dispatch }) => {
      await dispatch({ type: 'REDIRECTED' })
    },
    thunk: function() {}
  }
})

createTest('redirect after enter', {
  SECOND: {
    path: '/second',
    thunk: ({ dispatch }) => {
      return dispatch({ type: 'REDIRECTED' })
    },
    onComplete: function() {}
  }
})

createTest('redirect before enter (on firstRoute)', {
  FIRST: {
    path: '/first',
    beforeEnter: ({ dispatch }) => {
      return dispatch({ type: 'REDIRECTED' })
    },
    thunk: function() {}
  }
})

createTest('redirect after enter (on firstRoute)', {
  FIRST: {
    path: '/first',
    thunk: ({ dispatch }) => {
      return dispatch({ type: 'REDIRECTED' })
    },
    onComplete: function() {}
  }
})
