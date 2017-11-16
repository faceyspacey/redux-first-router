import { setupAll } from '../__test-helpers__/setup'
import notFound from '../src/action-creators/notFound'
import { NOT_FOUND } from '../src/index'
import redirect from '../src/action-creators/redirect'

it('dispatches location-aware action, changes address bar + document.title', async () => {
  const { store, history } = await setupAll()

  expect(history.location.pathname).toEqual('/')
  expect(store.getState().location).toMatchSnapshot()

  const payload = { param: 'bar' }
  const action = await store.dispatch({ type: 'SECOND', payload }) /*? $.meta */

  store.getState() /*? */

  expect(history.location.pathname).toEqual('/second/bar')
  expect(document.title).toEqual('SECOND')
  expect(action).toMatchSnapshot()
  expect(store.getState()).toMatchSnapshot()
})

it('dont double dispatch the same action', async () => {
  const jestNext = jest.fn((next, action) => next(action))
  const additionalMiddleware = store => next => action => jestNext(next, action)
  const { store, history } = await setupAll('/second/bar', undefined, {
    additionalMiddleware
  })

  expect(history.location.pathname).toEqual('/second/bar')
  expect(store.getState().location).toMatchSnapshot()

  const payload = { param: 'bar' }
  await store.dispatch({ type: 'SECOND', payload })

  console.log(store.getState())
  expect(history.length).toEqual(1)
  expect(jestNext).toHaveBeenCalledTimes(1)
})

it('not matched received action dispatches the action as normal with no changes', async () => {
  const { store, history } = await setupAll('/first')

  expect(history.location.pathname).toEqual('/first')
  expect(store.getState().location).toMatchObject({
    type: 'FIRST',
    pathname: '/first',
    payload: {}
  })

  const beforeState = store.getState().location
  const action = await store.dispatch({ type: 'BLA' }) /*? */
  const afterState = store.getState().location /*? */

  expect(action).toEqual({ type: 'BLA' }) // final action returned from middleware is the same as initially dispatched
  expect(history.location.pathname).toEqual('/first') // window.location has not changed because action not matched
  expect(store.getState().location).toMatchObject({
    // location state has not changed because action not matched
    type: 'FIRST',
    pathname: '/first',
    payload: {}
  })

  expect(afterState).toEqual(beforeState)
})

it('user dispatches NOT_FOUND and middleware adds missing info to action', async () => {
  const { store } = await setupAll('/first')
  const action = await store.dispatch(notFound({ type: NOT_FOUND })) /*? $.meta */

  store.getState() /*? $.location */

  expect(action).toMatchSnapshot()
})

it('user dispatches NOT_FOUND redirect and middleware adds missing info to action', async () => {
  const { store } = await setupAll('/first')
  const action = await store.dispatch(redirect({ type: NOT_FOUND })) /*? $.meta */

  store.getState() /*? $.location */

  expect(action).toMatchSnapshot()
})

it('does nothing if action has error', async () => {
  const { store } = await setupAll('/first')

  const receivedAction = {
    error: true,
    type: 'SECOND',
    meta: { location: { current: {} } }
  }

  store.dispatch(receivedAction) /*? */
  expect(store.getState().location.type).toEqual('FIRST')
})

it('user redirects', async () => {
  const beforeEnter = ({ action, dispatch }) => {
    if (action.type === 'THIRD') { // also test that a second redirect only results in one entry
      dispatch({ type: 'SECOND', payload: { param: 'foo' } })
    }
  }

  const { store, history } = await setupAll('/first', { beforeEnter })
  const action = await store.dispatch(redirect({ type: 'THIRD' })) /*? $.meta */

  store.getState() /*? $.location */
  expect(store.getState().location.length).toEqual(1)
  expect(store.getState().location.type).toEqual('SECOND')
})
