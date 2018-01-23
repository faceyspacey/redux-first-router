import createTest from '../../__helpers__/createTest'

createTest('automatically dispatch action object returned from thunk', {
  SECOND: {
    path: '/second',
    thunk: () => ({
      type: 'FOO'
    }),
    onComplete: function() {}
  }
})

createTest('create action /w payload + set type to currentActionType + _COMPLETE', {
  SECOND: {
    path: '/second',
    thunk: () => 'payload',
    onComplete: function() {}
  }
})
