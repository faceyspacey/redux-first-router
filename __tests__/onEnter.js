import { setupAll } from '../__test-helpers__/setup'
import setupThunk from '../__test-helpers__/setupThunk'
import redirect from '../src/action-creators/redirect'

it('calls route onEnter handler on route change', () => {
  const onEnter = jest.fn()

  const routesMap = {
    FIRST: '/first',
    SECOND: {
      path: '/second',
      onEnter
    },
    THIRD: '/third'
  }

  const { store } = setupAll('/first', undefined, { routesMap })

  const action = { type: 'SECOND' }
  store.dispatch(action)

  expect(onEnter).toHaveBeenCalled()
  expect(onEnter.mock.calls[0][1]()).toEqual(store.getState())
  expect(onEnter.mock.calls[0][2].action).toMatchObject(action)
  expect(onEnter.mock.calls[0][2].arg).toEqual('extra-arg')
})

it('calls global onEnter handler on route change', () => {
  const onEnter = jest.fn()
  const { store } = setupAll('/first', { onEnter })

  const action = { type: 'SECOND', payload: { param: 'bar' } }
  store.dispatch(action)

  expect(onEnter).toHaveBeenCalled()
  expect(onEnter.mock.calls[0][1]()).toEqual(store.getState())
  expect(onEnter.mock.calls[1][2].action).toMatchObject(action)
  expect(onEnter.mock.calls[1][2].arg).toEqual('extra-arg')
})

it.skip('skips onEnter on redirect', () => {
  const redirectAction = { type: 'THIRD', payload: { param: 'bar' } }
  const thunk = jest.fn(dispatch => {
    const action = redirect({ ...redirectAction })
    dispatch(action)
  })
  const onEnter = jest.fn()

  const { store } = setupThunk('/first', thunk, { onEnter })
  store.dispatch({ type: 'SECOND', payload: { param: 'bar' } })

  const { location } = store.getState()
  expect(location).toMatchObject(redirectAction)
  expect(onEnter).toHaveBeenCalled()
  expect(onEnter.mock.calls.length).toEqual(2) // would otherwise be called 3x if onEnter from SECOND route was not skipped
})
