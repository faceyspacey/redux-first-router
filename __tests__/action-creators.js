import redirect from '../src/action-creators/redirect'
import addRoutes from '../src/action-creators/addRoutes'
import * as h from '../src/action-creators/history'

import { setupAll } from '../__test-helpers__/setup'

it('redirect(action) - sets action.location.kind === "redirect"', () => {
  const receivedAction = { type: 'ANYTHING' }
  const action = redirect(receivedAction) /*? */

  expect(action.location.kind).toEqual('redirect')
})

it('addRoutes(routes) - adds routes to routesMap', async () => {
  const newRoutes = {
    FOO: { path: '/foo' },
    BAR: { path: '/bar' }
  }

  const { store } = await setupAll()

  const action = addRoutes(newRoutes)
  await store.dispatch(action)

  expect(store.getState()).toMatchSnapshot()

  await store.dispatch({ type: 'FOO' })
  expect(store.getState().location.type).toEqual('FOO')
})


it('setState', async () => {
  const onEnter = jest.fn()
  const routesMap = {
    FIRST: {
      path: '/first',
      onEnter
    }
  }
  const custom = { routesMap }

  const { store, history } = await setupAll('/first', undefined, custom)

  const action = h.setState({ foo: 'bar' })
  await store.dispatch(action)

  expect(history.location.state).toEqual({ foo: 'bar' })
  expect(history.kind).toEqual('setState')

  expect(store.getState().location.kind).toEqual('load')
  expect(onEnter).toHaveBeenCalledTimes(1) // setState should not trigger callbacks
  expect(store.getState()).toMatchSnapshot()
})


it('setState for another route', async () => {
  const { store, history } = await setupAll('/first')
  await store.dispatch({ type: 'THIRD' })

  const action = h.setState({ foo: 'bar' }, -1)
  await store.dispatch(action)

  const { location } = store.getState()
  expect(location.type).toEqual('THIRD')
  expect(location.entries[0].state).toEqual({ foo: 'bar' })

  expect(history.entries[0].state).toEqual({ foo: 'bar' })
  expect(history.kind).toEqual('setState')

  expect(store.getState().location.kind).toEqual('push')
  expect(store.getState()).toMatchSnapshot()
})

it('reset', async () => {
  const { store, history } = await setupAll('/first')
  console.log(store.getState().location)
  const entries = ['/second/foo', '/first', '/third', '/first']
  const action = h.reset(entries)
  await store.dispatch(action)

  expect(history.entries.length).toEqual(4)
  expect(history.kind).toEqual('next')

  expect(store.getState().location.kind).toEqual('next') // kind should be rewritten to 'push'
  expect(store.getState()).toMatchSnapshot()
})

it('back/next/jump', async () => {
  const { store, history } = await setupAll('/first')
  await store.dispatch({ type: 'THIRD' })

  let action = h.back((prevState) => ({ foo: 'bar' })) // optionally can be a function like in components
  await store.dispatch(action)

  expect(history.location.state).toEqual({ foo: 'bar' })
  expect(store.getState().location.kind).toEqual('back')
  expect(store.getState()).toMatchSnapshot()

  action = h.next((prevState) => ({ baz: 'bla' })) // optionally can be a function like in components
  await store.dispatch(action)

  expect(history.location.state).toEqual({ baz: 'bla' })
  expect(store.getState().location.kind).toEqual('next')
  expect(store.getState()).toMatchSnapshot()

  await store.dispatch({ type: 'SECOND', payload: { param: 'yo' } })

  action = h.jump(-2, (prevState) => ({ uno: 1 })) // optionally can be a function like in components
  await store.dispatch(action)

  expect(store.getState().location.type).toEqual('FIRST')
  expect(history.location.state).toEqual({ foo: 'bar', uno: 1 })
  expect(store.getState().location.kind).toEqual('back')
  expect(store.getState()).toMatchSnapshot()

  action = h.jump(2, (prevState) => ({ dos: 2 })) // optionally can be a function like in components
  await store.dispatch(action)

  expect(store.getState().location.type).toEqual('SECOND')
  expect(history.location.state).toEqual({ dos: 2 })
  expect(store.getState().location.kind).toEqual('next')
  expect(store.getState()).toMatchSnapshot()

  await store.dispatch(({ history }) => {
    if (history.canJump('345678')) {
      return h.jump('345678', (prev) => ({ uno: prev.foo.length + 1 }))
    }
  })

  expect(store.getState().location.type).toEqual('FIRST')
  expect(history.location.state).toEqual({ foo: 'bar', uno: 4 })
  expect(store.getState().location.kind).toEqual('back')
  expect(store.getState()).toMatchSnapshot()
})

