import { get } from '@respond-framework/rudy/src/history/utils/sessionStorage'
import createTest, { setupStore } from '../../../../__helpers__/createTest'

beforeAll(async () => {
  const routesMap = {
    FIRST: '/',
    SECOND: '/second',
    THIRD: '/third',
  }

  const { store, firstRoute, history } = setupStore(routesMap)

  const firstAction = firstRoute(false)
  await store.dispatch(firstAction)

  await store.dispatch({ type: 'SECOND' })
  await store.dispatch({ type: 'THIRD' })

  await store.dispatch({ type: 'SECOND' })
  await store.dispatch({ type: 'FIRST' }) // history.entries will be at first entry now

  history.unlisten()
})

createTest(
  'restore history when index === 0',
  {
    FIRST: '/',
    SECOND: '/second',
    THIRD: '/third',
  },
  { testBrowser: true },
  [],
  async ({ snapPop, getLocation }) => {
    expect(getLocation()).toMatchSnapshot()
    expect(get()).toMatchSnapshot()

    await snapPop('forward')
    await snapPop('forward')

    expect(getLocation().type).toEqual('THIRD')
    expect(window.location.pathname).toEqual('/third')

    expect(getLocation().index).toEqual(2)
    expect(getLocation().length).toEqual(3)

    expect(get()).toMatchSnapshot()
  },
)
