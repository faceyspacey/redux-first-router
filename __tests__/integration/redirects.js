import createTest from '../../__helpers__/createTest'

test('redirect before enter', async () => {
  await createTest({
    SECOND: {
      path: '/second',
      beforeEnter: jest.fn(({ dispatch }) => {
        dispatch({ type: 'REDIRECTED' })
      }),
      thunk: jest.fn()
    }
  })
})

test('redirect after enter', async () => {
  await createTest({
    THIRD: {
      path: '/third',
      thunk: jest.fn(({ dispatch }) => {
        dispatch({ type: 'REDIRECTED' })
      }),
      onComplete: jest.fn()
    }
  })
})
