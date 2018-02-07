import createTest from '../../__helpers__/createTest'
import { callRoute } from '../../src/utils'

createTest('callRoute(action | type, routeKey, ...args)', {
  SECOND: {
    path: '/second',
    foo: 'bar'
  },
  THIRD: {
    path: '/third',
    doSomething: (arg, action) => arg + action.type
  }
}, [], async ({ routes }) => {
  const call = callRoute(routes)

  expect(call('NONE')).toEqual(null)

  expect(call('SECOND').foo).toEqual('bar')

  expect(call('SECOND', 'foo')).toEqual('bar')
  expect(call({ type: 'SECOND' }, 'foo')).toEqual('bar')

  expect(call('THIRD', 'doSomething', 'arg')).toEqual('argTHIRD')
})
