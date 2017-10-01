import { setupAll } from '../__test-helpers__/setup'
import { NOT_FOUND } from '../src/index'
import redirect from '../src/action-creators/redirect'

it('dispatches location-aware action, changes address bar + document.title', () => {
  const { store, history } = setupAll()

  expect(document.title).toEqual('')
  expect(history.location.pathname).toEqual('/')
  expect(store.getState().location).toMatchSnapshot()

  const payload = { param: 'bar' }
  const action = store.dispatch({ type: 'SECOND', payload }) /*? $.meta */

  store.getState() /*? */

  expect(history.location.pathname).toEqual('/second/bar')
  expect(action).toMatchSnapshot()
  expect(store.getState()).toMatchSnapshot()
})

it('not matched received action dispatches the action as normal with no changes', () => {
  const { store, history } = setupAll('/first')

  expect(history.location.pathname).toEqual('/first')
  expect(store.getState().location).toMatchObject({
    type: 'FIRST',
    pathname: '/first',
    payload: {}
  })

  const beforeState = store.getState().location
  const action = store.dispatch({ type: 'BLA' }) /*? */
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

it('user dispatches NOT_FOUND and middleware adds missing info to action', () => {
  const { store } = setupAll('/first')
  const action = store.dispatch({ type: NOT_FOUND }) /*? $.meta */

  store.getState() /*? $.location */

  expect(action).toMatchSnapshot()
})

it('user dispatches NOT_FOUND redirect and middleware adds missing info to action', () => {
  const { store } = setupAll('/first')
  const action = store.dispatch(redirect({ type: NOT_FOUND })) /*? $.meta */

  store.getState() /*? $.location */

  expect(action).toMatchSnapshot()
})

it('does nothing if action has error', () => {
  const { store } = setupAll('/first')

  const receivedAction = {
    error: true,
    type: 'SECOND',
    meta: { location: { current: {} } }
  }

  store.dispatch(receivedAction) /*? */
  expect(store.getState().location.type).toEqual('FIRST')
})
