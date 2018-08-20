import createTest from '../../__helpers__/createTest'

createTest(
  'all options callbacks are called',
  {
    SECOND: {
      path: '/second',
    },
  },
  {
    beforeLeave: function() {},
    beforeEnter: function() {},
    onLeave: function() {},
    onEnter: function() {},
    thunk: function() {},
    onComplete: ({ action }) => {
      if (action.type !== 'SECOND') return
      throw new Error('test-error')
    },
    onError: function() {},
  },
)
