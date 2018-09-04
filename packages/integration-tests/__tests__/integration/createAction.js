import createTest from '../../__helpers__/createTest'

createTest(
  'add routeType_COMPLETE as type to action-like object that is missing type',
  {
    SECOND: {
      path: '/second',
      thunk: ({ dispatch }) => dispatch({ payload: 'foo' }),
      onComplete() {},
    },
  },
)

createTest('when isAction(action) === false set to payload', {
  SECOND: {
    path: '/second',
    thunk: ({ dispatch }) => dispatch({ foo: 'bar' }),
    onComplete() {},
  },
})

createTest('non object argument can be payload', {
  SECOND: {
    path: '/second',
    thunk: ({ dispatch }) => dispatch('foo'),
    onComplete() {},
  },
})

createTest('null payloads allowed', {
  SECOND: {
    path: '/second',
    thunk: ({ dispatch }) => dispatch(null),
    onComplete() {},
  },
})

createTest('arg as type', {
  SECOND: {
    path: '/second',
    thunk: ({ dispatch }) => dispatch('FOO_BAR'),
    onComplete() {},
  },
})

createTest('arg as @@library type', {
  SECOND: {
    path: '/second',
    thunk: ({ dispatch }) => dispatch('@@library/FOO_BAR'),
    onComplete() {},
  },
})

createTest('arg as type from route', {
  SECOND: {
    path: '/second',
    thunk: ({ dispatch }) => dispatch('FIRST'),
    onComplete() {},
  },
})
