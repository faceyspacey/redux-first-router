import createTest from '../../__helpers__/createTest'

createTest(
  'route.autoDispatch: false does not automatically dispatch callback return values',
  {
    SECOND: {
      path: '/second',
      autoDispatch: false,
      thunk: () => 'foo',
    },
  },
)

createTest(
  'options.autoDispatch: false does not automatically dispatch callback return values',
  {
    SECOND: {
      path: '/second',
      thunk: () => 'foo',
    },
  },
  { autoDispatch: false },
)
