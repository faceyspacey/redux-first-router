import createTest from '../../__helpers__/createTest'

jest.mock('../../src/utils/isServer', () => () => true)

createTest('redirect on server not dispatched; instead redirect info returned', {
  FIRST: {
    path: '/first',
    beforeEnter: function() {},
    thunk: ({ dispatch }) => {
      dispatch({ type: 'REDIRECTED' })
    }
  }
})
