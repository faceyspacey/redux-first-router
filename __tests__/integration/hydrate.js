import createTest from '../../__helpers__/createTest'

jest.mock('../../src/utils/isHydrate', () => () => true)
jest.mock('../../src/utils/isServer', () => () => false)

test('beforeEnter + thunk callbacks NOT called if isHydrate', async () => {
  await createTest({
    FIRST: {
      path: '/first',
      beforeEnter: jest.fn(),
      thunk: jest.fn(({ dispatch }) => {
        dispatch({ type: 'REDIRECTED' })
      }),
      onComplete: jest.fn()
    }
  })
})

