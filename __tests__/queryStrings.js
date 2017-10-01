import querySerializer from 'query-string'

import { setupAll } from '../__test-helpers__/setup'
import pathToAction from '../src/pure-utils/pathToAction'

it('dispatched as action.query', () => {
  const { store } = setupAll('/third', { querySerializer })
  const query = { foo: 'bar', baz: 69 }

  store.dispatch({ type: 'FIRST', query })
  store.dispatch({ type: 'THIRD', query })

  const state = store.getState() /*? $.location */
  expect(state).toMatchSnapshot()
})

it('dispatched as action.meta.query', () => {
  const { store } = setupAll('/third', { querySerializer })
  const query = { foo: 'bar', baz: 69 }

  store.dispatch({ type: 'FIRST', meta: { query } })
  store.dispatch({ type: 'THIRD', meta: { query } })

  const state = store.getState() /*? $.location */
  expect(state).toMatchSnapshot()
})

it('dispatched as action.payload.query', () => {
  const { store } = setupAll('/third', { querySerializer })
  const payload = { foo: 'bar', baz: 69 }

  store.dispatch({ type: 'FIRST', meta: { payload } })
  store.dispatch({ type: 'THIRD', meta: { payload } })

  const state = store.getState() /*? $.location */
  expect(state).toMatchSnapshot()
})

it('history.push("/path?search=foo")', () => {
  const { store, history } = setupAll('/third', { querySerializer })

  history.push('/first?foo=bar&baz=69')
  history.push('/third?foo=bar&baz=69')

  const state = store.getState() /*? $.location */
  expect(state).toMatchSnapshot()
})

it('currentPathName changes, but pathname stays the same (only query changes)', () => {
  const { store, history } = setupAll('/third', { querySerializer })

  history.push('/first?foo=bar&baz=69')
  history.push('/first?foo=car&baz=70')

  const state = store.getState() /*? $.location */
  expect(state).toMatchSnapshot()
})

it('generated from pathToAction within <Link />', () => {
  const { store, history, routesMap } = setupAll('/third', { querySerializer })

  let action = pathToAction(
    '/first?foo=bar&baz=69',
    routesMap,
    querySerializer
  ) /*? */
  store.dispatch(action)

  action = pathToAction(
    '/first?foo=car&baz=70',
    routesMap,
    querySerializer
  ) /*? */
  store.dispatch(action)

  const state = store.getState() /*? $.location */
  expect(state).toMatchSnapshot()
})
