import createTest from '../../__helpers__/createTest'

createTest('pathless route thunk called ', {
  PATHLESS: {
    thunk: ({ dispatch }) => {
      dispatch({ type: 'REDIRECTED' })
    }
  }
})
