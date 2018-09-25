import createTest from '../../__helpers__/createTest'

createTest('automatically dispatch action object returned from thunk', {
  SECOND: {
    path: '/second',
    thunk: () => ({
      type: 'FOO',
    }),
    onComplete() {},
  },
})

createTest('automatically infer non action object to be payload', {
  SECOND: {
    path: '/second',
    thunk: () => ({ foo: 'bar' }),
    onComplete() {},
  },
})
