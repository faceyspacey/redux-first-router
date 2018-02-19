import createTest from '../../../__helpers__/createTest'
import createScene from '../../../src/createScene'

const routesMap = {
  SECOND: {
    path: '/second',
    error: (error) => ({ ...error, foo: 'bar' })
  },
  THIRD: {
    path: '/third',
    action: (arg) => (req) => {
      return { params: { foo: arg } }
    }
  },
  FOURTH: {
    path: '/fourth',
    action: ['customCreator'],
    customCreator: (arg) => (req) => {
      return { params: { foo: arg } }
    }
  },
  PLAIN: {
    action: (arg) => {
      return { foo: arg }
    }
  },
  NOT_FOUND: '/not-found-foo'
}

const { actions, routes } = createScene(routesMap, {
  scene: 'SCENE',
  basename: '/base-name'
})

createTest('createScene(routes, { scene, basename })', routes, [
  ['actions.second()', actions.second()],
  ['actions.second(partialAction)', actions.second({ params: { foo: 'bar' } })],
  ['actions.second(params)', actions.second({ foo: 'bar' })],
  ['actions.second(thunk)', actions.second((req) => ({ testReq: req.getTitle() }))],
  ['actions.second(action with wrong type)', actions.second({ type: 'WRONG' })],
  ['route.action - custom action creator', actions.third('baz')],
  ['route.action: [] - custom action creators (array) - actions.fourth.customCreator()', actions.fourth.customCreator('baz')],
  ['actions.third.error(new Error)', actions.third.error(new Error('fail'))],
  ['route.error - custom error action creator', actions.second.error(new Error('fail'))],
  ['actions.third.complete(payload)', actions.third.complete({ foo: 'bar' })],
  ['actions.second.complete(thunk)', actions.second.complete(() => ({ foo: 'bar' }))],
  ['route with just action creator', actions.plain('bar')],
  ['actions.notFound(params, path)', actions.notFound({ foo: 'bar' }, '/cat')],
  ['actions.notFound.complete(payload)', actions.notFound.complete('foo')]
])
