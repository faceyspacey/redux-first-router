import createTest from '../../__helpers__/createTest'

test('pathless route thunk called ', async () => {
  await createTest({
    PATHLESS: {
      thunk: jest.fn(({ dispatch }) => {
        dispatch({ type: 'REDIRECTED' })
      })
    }
  })
})
