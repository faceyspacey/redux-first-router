
import { NOT_FOUND } from '../src/types'
import { createReducer, createInitialState } from '../src/core'
import createSmartHistory from '../src/history'
import reducerParameters from '../__test-helpers__/reducerParameters'

it('createReducer() - maintains address bar pathname state and current + previous matched location-aware actions', async () => {
  const { history, routesMap, action, expectState } = await reducerParameters(
    'SECOND',
    '/second/bar'
  )

  const reducer = createReducer(routesMap, history, {})
  const state = reducer(undefined, action) /*? */

  expectState(state)
})

it('locationReducer() reduces action.type === NOT_FOUND', async () => {
  const { history, routesMap, action } = await reducerParameters(
    NOT_FOUND,
    '/foo'
  )

  const reducer = createReducer(routesMap, history, {})
  const state = reducer(undefined, action) /*? */

  expect(state.type).toEqual(NOT_FOUND)
  expect(state.pathname).toEqual('/foo')
})

it('locationReducer() reduces non matched action.type and returns initialState', async () => {
  const { initialState, history, routesMap, action } = await reducerParameters(
    'THIRD',
    '/third'
  )

  const reducer = createReducer(routesMap, history, {})
  const state = reducer(undefined, action) /*? */

  expect(state).toEqual(initialState)
})

it('getInitialState() returns state.history === undefined when using createBrowserHistory', async () => {
  const pathname = '/first'
  const history = createSmartHistory({ initialEntries: ['/first'] })
  history.firstRoute.commit()

  const current = { pathname, type: 'FIRST', params: {} }
  const routesMap = {
    FIRST: { path: '/first' }
  }

  history.entries = undefined
  const initialState = createInitialState(routesMap, history, {})

  expect(initialState.history).not.toBeDefined()
  expect(initialState).toMatchSnapshot()
})
