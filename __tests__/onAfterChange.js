import { setupAll } from '../__test-helpers__/setup'
import setupThunk from '../__test-helpers__/setupThunk'
import redirect from '../src/action-creators/redirect'

it('calls onAfterChange handler on route change', () => {
  const onAfterChange = jest.fn()
  const { store } = setupAll('/first', { onAfterChange })

  const action = { type: 'SECOND', payload: { param: 'bar' } }
  store.dispatch(action)
  expect(onAfterChange).toHaveBeenCalled()
  expect(onAfterChange.mock.calls[0][1]()).toEqual(store.getState())
  expect(onAfterChange.mock.calls[1][2].action).toMatchObject(action)
  expect(onAfterChange.mock.calls[1][2].arg).toEqual('extra-arg')
})

it('skips onAfterChange on redirect', () => {
  const redirectAction = { type: 'THIRD', payload: { param: 'bar' } }
  const thunk = jest.fn(dispatch => {
    const action = redirect({ ...redirectAction })
    dispatch(action)
  })
  const onAfterChange = jest.fn()

  const { store } = setupThunk('/first', thunk, { onAfterChange })
  store.dispatch({ type: 'SECOND', payload: { param: 'bar' } })

  const { location } = store.getState()
  expect(location).toMatchObject(redirectAction)
  expect(onAfterChange).toHaveBeenCalled()
  expect(onAfterChange.mock.calls.length).toEqual(2) // would otherwise be called 3x if onAfterChange from SECOND route was not skipped
})
