import { setupAll } from '../__test-helpers__/setup'

it('dispatching thunk passes through anonymousThunk middleware', async () => {
  const { store, history } = await setupAll('/first')
  const thunk = jest.fn(({ dispatch }) => {
    return dispatch({ type: 'THIRD' })
  })

  const res = await store.dispatch(thunk)

  expect(res.type).toEqual('THIRD')
  expect(thunk).toHaveBeenCalled()
  expect(store.getState().location.type).toEqual('THIRD')
})

it('dispatching thunk which returns action is automatically dispatched', async () => {
  const { store, history } = await setupAll('/first')
  const thunk = jest.fn(() => {
    return { type: 'THIRD' }
  })

  const res = await store.dispatch(thunk)

  expect(res.type).toEqual('THIRD')
  expect(thunk).toHaveBeenCalled()
  expect(store.getState().location.type).toEqual('THIRD')
})
