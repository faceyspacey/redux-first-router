import createTest from '../../__helpers__/createTest'

test('automatically dispatch action object returned from thunk', async () => {
  await createTest({
    SECOND: {
      path: '/second',
      thunk: jest.fn(() => ({
        type: 'FOO'
      })),
      onComplete: jest.fn()
    }
  })
})

test('create action /w payload + set type to currentActionType + _COMPLETE', async () => {
  await createTest({
    SECOND: {
      path: '/second',
      thunk: jest.fn(() => 'payload'),
      onComplete: jest.fn()
    }
  })
})
