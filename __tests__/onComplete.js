import { setupAll } from '../__test-helpers__/setup'
import setupThunk from '../__test-helpers__/setupThunk'
import redirect from '../src/action-creators/redirect'

it('calls handler on route change -- global', () => {
  const onComplete = jest.fn()
  const { store } = setupAll('/first', { onComplete })

  const action = { type: 'SECOND', payload: { param: 'bar' } }
  store.dispatch(action)

  expect(onComplete).toHaveBeenCalled()
  expect(onComplete.mock.calls[0][1]()).toEqual(store.getState())
  expect(onComplete.mock.calls[1][2].action).toMatchObject(action)
  expect(onComplete.mock.calls[1][2].arg).toEqual('extra-arg')
})

it('calls handler on route change -- route', () => {
  const onComplete = jest.fn()

  const routesMap = {
    FIRST: '/first',
    SECOND: {
      path: '/second',
      onComplete
    },
    THIRD: '/third'
  }

  const { store } = setupAll('/first', undefined, { routesMap })
  const action = { type: 'SECOND' }
  store.dispatch(action)

  expect(onComplete).toHaveBeenCalled()
  expect(onComplete.mock.calls[0][1]()).toEqual(store.getState())
  expect(onComplete.mock.calls[0][2].action).toMatchObject(action)
  expect(onComplete.mock.calls[0][2].arg).toEqual('extra-arg')
})

it('skips onComplete on redirect', () => {
  const redirectAction = { type: 'THIRD', payload: { param: 'bar' } }
  const thunk = jest.fn(dispatch => {
    const action = redirect({ ...redirectAction })
    dispatch(action)
  })
  const onComplete = jest.fn()

  const { store } = setupThunk('/first', thunk, { onComplete })
  store.dispatch({ type: 'SECOND', payload: { param: 'bar' } })

  const { location } = store.getState()
  expect(location).toMatchObject(redirectAction)
  expect(onComplete).toHaveBeenCalled()
  expect(onComplete.mock.calls.length).toEqual(2) // would otherwise be called 3x if onComplete from SECOND route was not skipped
})
