import redirect from '../src/action-creators/redirect'
import addRoutes from '../src/action-creators/addRoutes'
import setState from '../src/action-creators/setState'

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
  const { store, history } = await setupAll('/first')

  const action = setState({ foo: 'bar' })
  await store.dispatch(action)

  expect(history.location.state).toEqual({ foo: 'bar' })
  expect(store.getState()).toMatchSnapshot()
})
