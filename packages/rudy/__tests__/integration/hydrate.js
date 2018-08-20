import createTest from '../../__helpers__/createTest'

jest.mock('../../src/utils/isHydrate', () => () => true)
jest.mock('../../src/utils/isServer', () => () => false)

createTest('beforeEnter + thunk callbacks NOT called if isHydrate', {
  FIRST: {
    path: '/first',
    beforeLeave() {},
    beforeEnter() {},
    onEnter() {},
    onLeave() {},
    thunk() {},
    onComplete() {},
  },
})
