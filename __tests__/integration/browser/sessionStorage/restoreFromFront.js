import createTest, { setupStore } from '../../../../__helpers__/createTest'
import { get } from '../../../../src/history/utils/sessionStorage'

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
}, { testBrowser: true }, [], async ({ snapPop, getLocation }) => {
  expect(getLocation()).toMatchSnapshot()
  expect(get()).toMatchSnapshot()

  await snapPop('back')
  await snapPop('back')

  expect(getLocation().type).toEqual('FIRST')
  expect(window.location.pathname).toEqual('/')

  expect(getLocation().index).toEqual(0)
  expect(getLocation().length).toEqual(3)

  expect(get()).toMatchSnapshot()
})
