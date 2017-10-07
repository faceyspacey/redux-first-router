import { setupAll } from '../__test-helpers__/setup'
import setupThunk from '../__test-helpers__/setupThunk'
import redirect from '../src/action-creators/redirect'

it('calls route onLeave handler on route change', () => {
  const onLeave = jest.fn()

  const routesMap = {
    FIRST: {
      path: '/first',
      onLeave
    },
    SECOND: '/second',
    THIRD: '/third'
  }

  const { store } = setupAll('/first', undefined, { routesMap })

  const action = { type: 'SECOND' }
  store.dispatch(action)

  expect(onLeave).toHaveBeenCalled()
  expect(onLeave.mock.calls[0][1]()).toEqual(store.getState())
  expect(onLeave.mock.calls[0][2].action).toMatchObject(action)
  expect(onLeave.mock.calls[0][2].arg).toEqual('extra-arg')
})

it('calls global onLeave handler on route change', () => {
  const onLeave = jest.fn()
  const { store } = setupAll('/first', { onLeave })

  const action = { type: 'SECOND', payload: { param: 'bar' } }
  store.dispatch(action)

  expect(onLeave).toHaveBeenCalled()
  expect(onLeave.mock.calls[0][1]()).toEqual(store.getState())
  expect(onLeave.mock.calls[1][2].action).toMatchObject(action)
  expect(onLeave.mock.calls[1][2].arg).toEqual('extra-arg')
})

it.skip('skips onLeave on redirect', () => {
  const redirectAction = { type: 'THIRD', payload: { param: 'bar' } }
  const thunk = jest.fn(dispatch => {
    const action = redirect({ ...redirectAction })
    dispatch(action)
  })
  const onLeave = jest.fn()

  const { store } = setupThunk('/first', thunk, { onLeave })
  store.dispatch({ type: 'SECOND', payload: { param: 'bar' } })

  const { location } = store.getState()
  expect(location).toMatchObject(redirectAction)
  expect(onLeave).toHaveBeenCalled()
  expect(onLeave.mock.calls.length).toEqual(2) // would otherwise be called 3x if onLeave from SECOND route was not skipped
})
