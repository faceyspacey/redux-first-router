import createTest from '../../__helpers__/createTest'

test('multiple redirects are honored', async () => {
  await createTest({
    SECOND: {
      path: '/second',
      beforeEnter: jest.fn(({ dispatch }) => {
        dispatch({ type: 'REDIRECTED' })
      }),
      thunk: jest.fn()
    },
    REDIRECTED: {
      path: '/redirected',
      beforeEnter: jest.fn(({ dispatch }) => {
        dispatch({ type: 'REDIRECTED_AGAIN' })
      }),
      thunk: jest.fn()
    },
    REDIRECTED_AGAIN: {
      path: '/redirected-again',
      thunk: jest.fn()
    }
  })
})

test('multiple redirects are honored after enter', async () => {
  await createTest({
    THIRD: {
      path: '/third',
      thunk: jest.fn(({ dispatch }) => {
        dispatch({ type: 'REDIRECTED_AFTER' })
      }),
      onComplete: jest.fn()
    },
    REDIRECTED_AFTER: {
      path: '/redirected-after',
      thunk: jest.fn(({ dispatch }) => {
        dispatch({ type: 'REDIRECTED_AGAIN_AFTER' })
      }),
      onComplete: jest.fn()
    },
    REDIRECTED_AGAIN_AFTER: {
      path: '/redirected-again-after',
      onComplete: jest.fn()
    }
  })
})
