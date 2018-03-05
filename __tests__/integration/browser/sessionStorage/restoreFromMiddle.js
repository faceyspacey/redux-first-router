import createTest, { setupStore } from '../../../../__helpers__/createTest'

beforeAll(async () => {
  const routesMap = {
    FIRST: '/',
    SECOND: '/second',
    THIRD: '/third'
  }

  const { store, firstRoute, history } = setupStore(routesMap)

  const firstAction = firstRoute(false)
  await store.dispatch(firstAction)

  await store.dispatch({ type: 'SECOND' })
  await store.dispatch({ type: 'THIRD' })
  await store.dispatch({ type: 'SECOND' }) // go back, so we can simulate leaving in the middle of the stack

  history.unlisten()
})

createTest('restore history from sessionStorage', {
  FIRST: '/',
  SECOND: '/second',
  THIRD: '/third'
}, { browser: true }, [], async ({ snapPop, getLocation }) => {
  await snapPop('back')

  expect(getLocation().type).toEqual('FIRST')
  expect(window.location.pathname).toEqual('/')

  expect(getLocation().index).toEqual(0)

  // this is key, since we left in the middle of the entries (at SECOND), THIRD will be erased on return,
  // just like the real browser when you push a whole new website
  expect(getLocation().length).toEqual(2)
})
