import { get } from '@respond-framework/rudy/src/history/utils/sessionStorage'
import createTest, { setupStore } from '../../../../__helpers__/createTest'

// note restoreFromMiddle is in fact the same as restoreFromFront
// since `sessionStorage.js` clips all entries after the current index
// since they would have been lost if you navigated to another site

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
  await store.dispatch({ type: 'SECOND' }) // go back, so we can simulate leaving in the middle of the stack

  history.unlisten()
})

createTest(
  'restore history when index > 0',
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

    await snapPop('back')

    expect(getLocation().type).toEqual('FIRST')
    expect(window.location.pathname).toEqual('/')

    expect(getLocation().index).toEqual(0)

    // this is key, since we left in the middle of the entries (at SECOND), THIRD will be erased on return,
    // just like the real browser when you push a whole new website
    expect(getLocation().length).toEqual(2)

    expect(get()).toMatchSnapshot()
  },
)
