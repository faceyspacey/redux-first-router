import createTest from '../../__helpers__/createTest'

jest.mock('../../src/utils/isHydrate', () => () => false)
jest.mock('../../src/utils/isServer', () => () => false)

test('callbacks called on load if SPA', async () => {
  await createTest({
    FIRST: {
      path: '/first',
      beforeEnter: jest.fn(),
      thunk: jest.fn(({ dispatch }) => {
        dispatch({ type: 'REDIRECTED' })
      })
    }
  })
})
