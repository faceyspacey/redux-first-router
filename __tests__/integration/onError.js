import createTest from '../../__helpers__/createTest'

test('route onError called if other callbacks throw', async () => {
  await createTest({
    SECOND: {
      path: '/second',
      thunk: jest.fn(() => {
        throw new Error('thunk-failed')
      }),
      onError: jest.fn()
    }
  })
})

test('route onError dispatches redirect', async () => {
  await createTest({
    THIRD: {
      path: '/third',
      thunk: jest.fn(() => {
        throw new Error('thunk-failed')
      }),
      onError: jest.fn(() => ({ type: 'REDIRECTED' }))
    }
  })
})

test('currentType_ERROR dispatched if no onError callback provided', async () => {
  await createTest({
    FOURTH: {
      path: '/second',
      thunk: jest.fn(() => {
        throw new Error('thunk-failed')
      })
    }
  })
})
