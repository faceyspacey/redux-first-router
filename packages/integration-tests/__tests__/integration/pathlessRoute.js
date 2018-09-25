import createTest from '../../__helpers__/createTest'

createTest('pathless route thunk called', {
  PATHLESS: {
    thunk: async ({ dispatch }) => dispatch({ type: 'REDIRECTED' }),
    onComplete() {},
  },
})

createTest('pathless route thunk errors trigger onError', {
  PATHLESS: {
    thunk: ({ dispatch }) => {
      throw new Error('fail')
    },
    onError() {},
    onComplete() {},
  },
})
