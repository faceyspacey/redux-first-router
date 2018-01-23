import createTest from '../../__helpers__/createTest'

jest.mock('../../src/utils/isHydrate', () => () => true)
jest.mock('../../src/utils/isServer', () => () => false)

createTest('beforeEnter + thunk callbacks NOT called if isHydrate', {
  FIRST: {
    path: '/first',
    beforeEnter: function() {},
    thunk: function() {},
    onComplete: function() {}
  }
})

