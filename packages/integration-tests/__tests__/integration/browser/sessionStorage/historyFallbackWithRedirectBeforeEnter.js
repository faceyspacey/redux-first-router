import createTest, { setupStore } from '../../../../__helpers__/createTest'

// when there is no `sessionStorage`, we fallback to our innovative solution of
// storing all session info on EVERY entry of the real browser history!

jest.mock('@respond-framework/rudy/src/history/utils/supports', () => ({
  ...require.requireActual(
    '@respond-framework/rudy/src/history/utils/supports',
  ),
  supportsSession: jest.fn(() => false),
}))

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
  'restore history from history fallback with redirect before enter',
  {
    FIRST: {
      path: '/',
      beforeEnter: ({ dispatch }) => dispatch({ type: 'REDIRECTED' }),
      thunk() {},
    },
    SECOND: '/second',
    THIRD: '/third',
  },
  { testBrowser: true },
  [],
  async ({ snapPop, snap, getLocation }) => {
    expect(getLocation()).toMatchSnapshot()

    // // firstRoute dispatched by `createTest`
    expect(window.history.state.index).toEqual(0)
    expect(getLocation().type).toEqual('REDIRECTED')
    expect(window.location.pathname).toEqual('/redirected')
    expect(window.history.state).toMatchSnapshot()

    await snapPop('forward')
    expect(window.history.state.index).toEqual(1)
    expect(getLocation().type).toEqual('SECOND')
    expect(window.location.pathname).toEqual('/second')
    expect(window.history.state).toMatchSnapshot()

    await snapPop('forward')
    expect(window.history.state.index).toEqual(2)
    expect(getLocation().type).toEqual('THIRD')
    expect(window.location.pathname).toEqual('/third')
    expect(window.history.state).toMatchSnapshot()

    expect(getLocation().index).toEqual(2)
    expect(getLocation().length).toEqual(3)

    // and let's do a push for good measure
    await snap({ type: 'FIRST' })
    expect(getLocation().type).toEqual('REDIRECTED')
    expect(getLocation().index).toEqual(3)
    expect(getLocation().length).toEqual(4)
    expect(window.history.state.index).toEqual(3)
    expect(window.history.state).toMatchSnapshot()
  },
)
