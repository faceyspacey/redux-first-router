import createTest from '../../__helpers__/createTest'

createTest('pathless route thunk called', {
  PATHLESS: {
    thunk: async ({ dispatch }) => {
      return dispatch({ type: 'REDIRECTED' })
    },
    onComplete: function() {}
  }
})

createTest('pathless route thunk errors trigger onError', {
  PATHLESS: {
    thunk: ({ dispatch }) => {
      throw new Error('fail')
    },
    onError: function() {},
    onComplete: function() { }
  }
})
