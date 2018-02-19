import createTest from '../../__helpers__/createTest'

createTest('add routeType_COMPLETE as type to action-like object that is missing type', {
  SECOND: {
    path: '/second',
    thunk: ({ dispatch }) => {
      return dispatch({ payload: 'foo' })
    },
    onComplete: function() {}
  }
})

createTest('when isAction(action) === false set to payload', {
  SECOND: {
    path: '/second',
    thunk: ({ dispatch }) => {
      return dispatch({ foo: 'bar' })
    },
    onComplete: function() {}
  }
})

createTest('non object argument can be payload', {
  SECOND: {
    path: '/second',
    thunk: ({ dispatch }) => {
      return dispatch('foo')
    },
    onComplete: function() {}
  }
})

createTest('null payloads allowed', {
  SECOND: {
    path: '/second',
    thunk: ({ dispatch }) => {
      return dispatch(null)
    },
    onComplete: function() {}
  }
})
