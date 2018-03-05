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

  history.unlisten()
})

createTest('restore history from sessionStorage', {
  FIRST: '/',
  SECOND: '/second',
  THIRD: '/third'
}, { browser: true }, [], async ({ snapPop, getLocation }) => {
  await snapPop('back')
  await snapPop('back')

  expect(getLocation().type).toEqual('FIRST')
  expect(window.location.pathname).toEqual('/')

  expect(getLocation().index).toEqual(0)
  expect(getLocation().length).toEqual(3)
})
