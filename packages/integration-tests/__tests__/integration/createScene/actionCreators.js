import createScene from '@respond-framework/rudy/src/createScene'
import createTest from '../../../__helpers__/createTest'

const routesMap = {
  SECOND: {
    path: '/second/:foo?',
    error: (error) => ({ ...error, foo: 'bar' }),
  },
  THIRD: {
    path: '/third/:foo',
    action: (arg) => (req) => ({ params: { foo: arg } }),
  },
  FOURTH: {
    path: '/fourth/:foo?',
    action: ['customCreator'],
    customCreator: (arg) => (req) => ({ params: { foo: arg } }),
  },
  PLAIN: {
    action: (arg) => ({ foo: arg }),
  },
  NOT_FOUND: '/not-found-foo',
}

const { actions, routes } = createScene(routesMap)

createTest('createScene()', routes, [
  ['actions.second()', actions.second()],
  ['actions.second(partialAction)', actions.second({ params: { foo: 'bar' } })],
  ['actions.second(params)', actions.second({ foo: 'bar' })],
  ['actions.second(thunk)', actions.second((req) => ({ foo: req.getTitle() }))],
  ['actions.second(action with wrong type)', actions.second({ type: 'WRONG' })],
  ['route.action - custom action creator', actions.third('baz')],
  [
    'route.action: [] - custom action creators (array) - actions.fourth.customCreator()',
    actions.fourth.customCreator('baz'),
  ],
  ['actions.third.error(new Error)', actions.third.error(new Error('fail'))],
  [
    'route.error - custom error action creator',
    actions.second.error(new Error('fail')),
  ],
  ['actions.third.complete(payload)', actions.third.complete({ foo: 'bar' })],
  [
    'actions.second.complete(thunk)',
    actions.second.complete(() => ({ foo: 'bar' })),
  ],
  ['route with just action creator', actions.plain('hello')],
  ['actions.notFound(state)', actions.notFound({ foo: 'bar' })],
  ['actions.notFound.complete(payload)', actions.notFound.complete('foo')],
])
