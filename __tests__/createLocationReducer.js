import createLocationReducer from '../src/createLocationReducer'
import { NOT_FOUND } from '../src/actions'
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
