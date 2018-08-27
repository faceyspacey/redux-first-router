import { callRoute } from '@respond-framework/rudy/src/utils'
import createTest from '../../__helpers__/createTest'

createTest(
  'callRoute(action | type, routeKey, ...args)',
  {
    SECOND: {
      path: '/second',
      foo: 'bar',
    },
    THIRD: {
      path: '/third',
      doSomething: (action, arg1, arg2) => action.type + arg1 + arg2,
    },
  },
  [],
  async ({ routes }) => {
    const call = callRoute(routes)

    expect(call('NONE')).toEqual(null)

    expect(call('SECOND').foo).toEqual('bar')

    expect(call('SECOND', 'foo')).toEqual('bar')
    expect(call({ type: 'SECOND' }, 'foo')).toEqual('bar')

    expect(call('THIRD', 'doSomething', 'arg1', 'arg2')).toEqual(
      'THIRDarg1arg2',
    )
  },
)
