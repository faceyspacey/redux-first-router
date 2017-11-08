import { setupAll } from '../__test-helpers__/setup'

it('dispatches location-aware action when store is first created so app is location aware on load', async () => {
  const { store } = await setupAll('/first')
  const location = store.getState().location

  expect(location).toMatchObject({
    type: 'FIRST',
    payload: {},
    kind: 'load' // IMPORTANT: only dispatched on load
  })
})

it("listens to history changes and dispatches actions matching history's location.pathname", async () => {
  const { store, history } = await setupAll('/first')

  await history.push('/second/bar')
  const location1 = store.getState().location

  expect(location1).toMatchObject({
    type: 'SECOND',
    pathname: '/second/bar',
    payload: { param: 'bar' },
    kind: 'push' // IMPORTANT: only dispatched when using browser back/forward buttons
  })

  await history.back()
  const location2 = store.getState().location

  expect(location2.type).toEqual('FIRST')
  expect(location2.pathname).toEqual('/first')
})


