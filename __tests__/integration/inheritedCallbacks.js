import createTest from '../../__helpers__/createTest'

createTest('inherit individual callback from another route', {
  FIRST: {
    path: '/first',
    thunk: 'SECOND'
  },
  SECOND: {
    path: '/second',
    thunk: function() {}
  }
}, ['/first'])

createTest('inherit all callbacks from another route', {
  FIRST: {
    path: '/first',
    inherit: 'SECOND'
  },
  SECOND: {
    path: '/second',
    beforeEnter: function() {},
    thunk: function() {},
    onComplete: function() {}
  }
}, ['/first'])

createTest('recursively inherit callback', {
  FIRST: {
    path: '/first',
    thunk: 'SECOND'
  },
  SECOND: {
    path: '/second',
    thunk: 'THIRD'
  },
  THIRD: {
    path: '/third',
    thunk: function({ action }) {
      return action.type + ' - payload'
    }
  }
}, ['/first'])
