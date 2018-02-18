import createTest from '../../__helpers__/createTest'

createTest('multiple redirects are honored', {
  SECOND: {
    path: '/second',
    beforeEnter: ({ dispatch }) => {
      return dispatch({ type: 'REDIRECTED' })
    },
    thunk: function() {}
  },
  REDIRECTED: {
    path: '/redirected',
    beforeEnter: ({ dispatch }) => {
      return dispatch({ type: 'REDIRECTED_AGAIN' })
    },
    thunk: function() {}
  },
  REDIRECTED_AGAIN: {
    path: '/redirected-again',
    thunk: function() {}
  }
})

createTest('multiple redirects are honored after enter', {
  SECOND: {
    path: '/second',
    thunk: ({ dispatch }) => {
      return dispatch({ type: 'REDIRECTED_AFTER' })
    },
    onComplete: function() {}
  },
  REDIRECTED_AFTER: {
    path: '/redirected-after',
    thunk: ({ dispatch }) => {
      return dispatch({ type: 'REDIRECTED_AGAIN_AFTER' })
    },
    onComplete: function() {}
  },
  REDIRECTED_AGAIN_AFTER: {
    path: '/redirected-again-after',
    onComplete: function() {}
  }
})
