import { setupAll } from '../__test-helpers__/setup'
import setupThunk from '../__test-helpers__/setupThunk'
import redirect from '../src/actions/redirect'

it('calls route onLeave handler on route change', async () => {
  const onLeave = jest.fn()

  const routesMap = {
    FIRST: {
      path: '/first',
      onLeave
    },
    SECOND: '/second',
    THIRD: '/third'
  }

  const { store } = await setupAll('/first', undefined, { routesMap })

  const action = { type: 'SECOND' }
  await store.dispatch(action)

  expect(store.getState().location.type).toEqual('SECOND')

  expect(onLeave).toHaveBeenCalled()
  expect(onLeave.mock.calls[0][0].action).toMatchObject(action)
  expect(onLeave.mock.calls[0][0].arg).toEqual('extra-arg')
})

it('calls global onLeave handler on route change', async () => {
  const onLeave = jest.fn()
  const { store } = await setupAll('/first', { onLeave })

  const action = { type: 'SECOND', params: { param: 'bar' } }
  await store.dispatch(action)

  expect(store.getState().location.type).toEqual('SECOND')

  expect(onLeave).toHaveBeenCalled()
  expect(onLeave.mock.calls[0][0].action).toMatchObject(action)
  expect(onLeave.mock.calls[0][0].arg).toEqual('extra-arg')
})

it('skips onLeave on redirect', async () => {
  const redirectAction = { type: 'THIRD', params: { param: 'bar' } }
  const beforeEnter = jest.fn(({ dispatch, action }) => {
    if (action.type !== 'SECOND') return
    dispatch({ ...redirectAction })
  })
  const onLeave = jest.fn()

  const { store } = await setupAll('/first', { beforeEnter, onLeave })
  await store.dispatch({ type: 'SECOND', params: { param: 'bar' } })

  const { location } = store.getState()
  expect(location.type).toEqual('THIRD')

  expect(location).toMatchObject(redirectAction)
  expect(onLeave).toHaveBeenCalled()
  expect(onLeave.mock.calls.length).toEqual(1) // would otherwise be called 3x if onLeave from SECOND route was not skipped
})
