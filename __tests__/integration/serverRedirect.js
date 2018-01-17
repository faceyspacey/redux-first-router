import createTest from '../../__helpers__/createTest'

jest.mock('../../src/utils/isServer', () => () => true)

test('redirect on server not dispatched; instead redirect info returned', async () => {
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
