import createTest from '../../__helpers__/createTest'

createTest(
  'all options callbacks are called',
  {
    SECOND: {
      path: '/second',
    },
  },
  {
    beforeLeave() {},
    beforeEnter() {},
    onLeave() {},
    onEnter() {},
    thunk() {},
    onComplete: ({ action }) => {
      if (action.type !== 'SECOND') return
      throw new Error('test-error')
    },
    onError() {},
  },
)
