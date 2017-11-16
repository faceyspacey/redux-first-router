import setup, { defaultRoutes, log, me } from '../__test-helpers__/rudySetup'
import { NOT_FOUND } from '../src'
import createScene from '../src/createScene'
import formatRoutes from '../src/utils/formatRoutes'

test('createScene', async () => {
  const tools = setup(undefined, undefined, { scene: 'SCENE', logExports: true })
  const { store, firstRoute, types, actions, exportString, routes } = tools
  let action = firstRoute()

  let res = await store.dispatch(action)
  expect(store.getState().location.type).toEqual('SCENE/FIRST')

  res = await store.dispatch(actions.second())
  console.log(actions.second())
  expect(store.getState().location.type).toEqual('SCENE/SECOND')

  action = actions.third((req, type) => ({ testReq: req.getTitle(), type }))
  res = await store.dispatch(action)
  expect(store.getState().location.type).toEqual('SCENE/THIRD')

  action = actions.fourth('baz')
  res = await store.dispatch(action)
  console.log(action)
  expect(store.getState().location.type).toEqual('SCENE/FOURTH')
  expect(res).toEqual({ type: 'SCENE/FOURTH_COMPLETE', payload: 'onComplete' })

  expect(store.getState().location.payload).toEqual({ foo: 'baz' })

  res = await store.dispatch(actions.second({ payload: { foo: 'bar' } }))
  expect(store.getState().location.type).toEqual('SCENE/SECOND')
  expect(store.getState().location.payload).toEqual({ foo: 'bar' })

  res = await store.dispatch(actions.third({ type: 'WRONG' }))
  expect(store.getState().location.type).toEqual('SCENE/SECOND')

  res = await store.dispatch(actions.third.error(new Error('fail')))
  console.log('RES', res)
  expect(store.getState().location.type).toEqual('SCENE/SECOND')
  expect(store.getState().location.error).toEqual(new Error('fail'))
  expect(store.getState().location.errorType).toEqual('SCENE/THIRD_ERROR')

  res = await store.dispatch(actions.third.complete({ foo: 'bar' }))
  expect(res.type).toEqual('SCENE/THIRD_COMPLETE')
  expect(res.payload).toEqual({ foo: 'bar' })

  res = await store.dispatch(actions.plain('bar'))
  expect(res.type).toEqual('SCENE/PLAIN')
  expect(res.payload).toEqual({ foo: 'bar' })

  log(store)

  expect(types).toMatchSnapshot()
  expect(actions).toMatchSnapshot()
  expect(exportString).toMatchSnapshot()
})

test('NOT_FOUND', async () => {
  const tools = setup(undefined, undefined, { scene: 'SCENE', logExports: true })
  const { store, firstRoute, types, actions, exportString, routes } = tools
  let action = firstRoute()

  console.log(routes)

  let res = await store.dispatch(action)
  expect(store.getState().location.type).toEqual('SCENE/FIRST')

  action = actions.notFound({ foo: 'bar' }, 'cat')
  res = await store.dispatch(action)

  expect(store.getState().location.type).toEqual('SCENE/@@rudy/NOT_FOUND')

  expect(action).toMatchSnapshot()
  expect(store.getState().location).toMatchSnapshot()
})


test('double createScene', async () => {
  const { routes: r } = createScene(defaultRoutes, { scene: 'scene' })
  const { types, actions, routes: r2, exportString } = createScene(r, { scene: 'double', logExports: true })
  const routes = formatRoutes(r2)

  const custom = { createScene: false, routesMap: routes }
  const { store, firstRoute, location } = setup('/first', undefined, custom)
  let action
  let res

  action = firstRoute()
  res = await store.dispatch(action)
  expect(res.type).toEqual('double/scene/FIRST')
  expect(location().type).toEqual('double/scene/FIRST')

  action = actions.second({ foo: 'bar' })
  res = await store.dispatch(action)
  expect(res.type).toEqual(types.SECOND)
  expect(res.type).toEqual('double/scene/SECOND')
  expect(location().type).toEqual('double/scene/SECOND')
  expect(location().payload).toEqual({ foo: 'bar' })

  action = { type: types.THIRD }
  res = await store.dispatch(action)
  expect(res.type).toEqual(types.THIRD_COMPLETE)
  expect(res.type).toEqual('double/scene/THIRD_COMPLETE')
  expect(location().type).toEqual('double/scene/THIRD')

  action = actions.fourth('bar')
  res = await store.dispatch(action)
  expect(res.type).toEqual(types.FOURTH_COMPLETE)
  expect(res.type).toEqual('double/scene/FOURTH_COMPLETE')
  expect(location().type).toEqual('double/scene/FOURTH')
  expect(location().payload).toEqual({ foo: 'bar' })

  action = actions.notFound(() => ({ foo: 'bar' }))
  res = await store.dispatch(action)
  expect(res.type).toEqual(types.NOT_FOUND)
  expect(res.type).toEqual('double/scene/@@rudy/NOT_FOUND')
  expect(location().type).toEqual('double/scene/@@rudy/NOT_FOUND')
  expect(location().payload).toEqual({ foo: 'bar' })
  expect(location().pathname).toEqual('/not-found-foo')

  action = actions.second.error({ foo: 'bar' })
  res = await store.dispatch(action)
  expect(res.type).toEqual(types.SECOND_ERROR)
  expect(res.type).toEqual('double/scene/SECOND_ERROR')
  expect(location().error).toEqual({ foo: 'bar', bla: 'boo' })
  expect(store.getState().title).toEqual('double/scene/SECOND_ERROR')

  action = actions.third.complete(() => ({ foo: 'bar' }))
  res = await store.dispatch(action)
  expect(res.type).toEqual(types.THIRD_COMPLETE)
  expect(res.type).toEqual('double/scene/THIRD_COMPLETE')
  expect(res.payload).toEqual({ foo: 'bar' })
  expect(store.getState().title).toEqual('double/scene/THIRD_COMPLETE')

  expect(location().type).toEqual('double/scene/@@rudy/NOT_FOUND') // check that previous actions didn't change routes

  action = actions.third.customCreator('bar')
  res = await store.dispatch(action)
  expect(res.type).toEqual(types.THIRD_COMPLETE)
  expect(res.type).toEqual('double/scene/THIRD_COMPLETE')
  expect(location().type).toEqual('double/scene/THIRD')
  expect(location().payload).toEqual({ foo: 'bar' })

  action = actions.notFound.complete('bar')
  res = await store.dispatch(action)
  expect(res.type).toEqual(types.NOT_FOUND_COMPLETE)
  expect(res.type).toEqual('double/scene/@@rudy/NOT_FOUND_COMPLETE')

  // location state equals previous state, since COMPLETE doesn't change routes
  expect(location().type).toEqual('double/scene/THIRD')
  expect(location().payload).toEqual({ foo: 'bar' })

  expect(types).toMatchSnapshot()
  expect(actions).toMatchSnapshot()
  expect(routes).toMatchSnapshot()
  expect(exportString).toMatchSnapshot()
})
