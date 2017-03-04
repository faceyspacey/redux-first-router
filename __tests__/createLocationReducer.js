import { createMemoryHistory } from 'history'
import createLocationReducer, { getInitialState } from '../src/reducer/createLocationReducer'
import { NOT_FOUND } from '../src/index'
import reducerParameters from '../__test-helpers__/reducerParameters'


it('createLocationReducer() - maintains address bar pathname state and current + previous matched location-aware actions', () => {
  const {
    initialState,
    routesMap,
    action,
    expectState,
  } = reducerParameters('SECOND', '/second/bar')

  const reducer = createLocationReducer(initialState, routesMap)
  const state = reducer(undefined, action)

  console.log(state)

  expectState(state)
})


it('locationReducer() reduces action.type === NOT_FOUND', () => {
  const {
    initialState,
    routesMap,
    action,
  } = reducerParameters(NOT_FOUND, '/foo')

  const reducer = createLocationReducer(initialState, routesMap)
  const state = reducer(undefined, action)

  console.log(state)

  expect(state.type).toEqual(NOT_FOUND)
  expect(state.pathname).toEqual('/foo')
})


it('locationReducer() reduces non matched action.type and returns initialState', () => {
  const {
    initialState,
    routesMap,
    action,
  } = reducerParameters('THIRD', '/third')

  const reducer = createLocationReducer(initialState, routesMap)
  const state = reducer(undefined, action)

  console.log(state)

  expect(state).toEqual(initialState)
})


it('getInitialState() returns state.history === undefined when using createBrowserHistory', () => {
  const pathname = '/first'
  const history = createMemoryHistory({ initialEntries: [pathname] })
  const current = { pathname, type: 'FIRST', payload: {} }
  const routesMap = {
    FIRST: '/first',
  }

  history.entries = undefined
  const initialState = getInitialState(current.pathname, current.type, current.payload, routesMap, history)

  expect(initialState.history).not.toBeDefined()
  expect(initialState).toMatchSnapshot()
})

