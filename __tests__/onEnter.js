import { setupAll } from '../__test-helpers__/setup'
import setupThunk from '../__test-helpers__/setupThunk'
import redirect from '../src/actions/redirect'

it('calls route onEnter handler on route change', async () => {
  const onEnter = jest.fn()

  const routesMap = {
    FIRST: '/first',
    SECOND: {
      path: '/second',
      onEnter
    },
    THIRD: '/third'
  }

  const { store } = await setupAll('/first', undefined, { routesMap })

  const action = { type: 'SECOND' }
  await store.dispatch(action)

  expect(store.getState().location.type).toEqual('SECOND')

  expect(onEnter).toHaveBeenCalled()
  expect(onEnter.mock.calls[0][0].action).toMatchObject(action)
  expect(onEnter.mock.calls[0][0].arg).toEqual('extra-arg')
})

it('calls global onEnter handler on route change', async () => {
  const onEnter = jest.fn()
  const { store } = await setupAll('/first', { onEnter })

  const action = { type: 'SECOND', payload: { param: 'bar' } }
  await store.dispatch(action)

  expect(store.getState().location.type).toEqual('SECOND')

  expect(onEnter).toHaveBeenCalled()
  expect(onEnter.mock.calls[1][0].action).toMatchObject(action)
  expect(onEnter.mock.calls[1][0].arg).toEqual('extra-arg')
})

it('skips onEnter on redirect', async () => {
  const redirectAction = { type: 'THIRD', payload: { param: 'bar' } }
  const beforeEnter = jest.fn(({ dispatch, action }) => {
    if (action.type !== 'SECOND') return
    dispatch({ ...redirectAction })
  })
  const onEnter = jest.fn()

  const { store } = await setupAll('/first', { beforeEnter, onEnter })
  await store.dispatch({ type: 'SECOND', payload: { param: 'bar' } })

  const { location } = store.getState()
  expect(location.type).toEqual('THIRD')

  expect(location).toMatchObject(redirectAction)
  expect(onEnter).toHaveBeenCalled()
  expect(onEnter.mock.calls.length).toEqual(2) // would otherwise be called 3x if onEnter from SECOND route was not skipped
})
