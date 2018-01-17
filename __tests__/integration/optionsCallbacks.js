import createTest from '../../__helpers__/createTest'

test('all options callbacks are called', async () => {
  await createTest({
    SECOND: {
      path: '/second'
    }
  }, {
    beforeLeave: jest.fn(),
    beforeEnter: jest.fn(),
    onLeave: jest.fn(),
    onEnter: jest.fn(),
    thunk: jest.fn(),
    onComplete: jest.fn(({ action }) => {
      if (action.type !== 'SECOND') return
      throw new Error('test-error')
    }),
    onError: jest.fn()
  })
})
