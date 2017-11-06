import setup from '../__test-helpers__/setup'
import reducerParameters from '../__test-helpers__/reducerParameters'

it('reducer EXISTS and works (see __tests__/createLocationReducer for all its tests)', async () => {
  const { reducer } = await setup()
  const { action } = await reducerParameters('SECOND', '/second/bar')

  const state = reducer(undefined, action)

  expect(state.pathname).toEqual('/second/bar')
})
