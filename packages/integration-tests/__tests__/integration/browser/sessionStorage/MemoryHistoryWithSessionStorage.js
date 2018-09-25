import { get } from '@respond-framework/rudy/src/history/utils/sessionStorage'
import createTest, { setupStore } from '../../../../__helpers__/createTest'

// MemoryHistory can be used as a fallback in the browser (ie. 8/9)
// Those browsers do support SessionStorage, so we have capabilities to remember
// entries even in those older browsers.

jest.mock('@respond-framework/rudy/src/history/utils/supports', () => ({
  ...require.requireActual(
    '@respond-framework/rudy/src/history/utils/supports',
  ),
  supportsSession: jest.fn(() => true),
  supportsHistory: jest.fn(() => false),
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
})

createTest(
  'restore history from sessionStorage when using MemoryHistory as fallback',
  {
    FIRST: '/',
    SECOND: '/second',
    THIRD: '/third',
  },
  { testBrowser: true },
  [],
  async ({ snap, getLocation, getState }) => {
    expect(getState()).toMatchSnapshot()
    expect(get()).toMatchSnapshot()

    // firstRoute dispatched by `createTest`
    expect(getLocation().type).toEqual('FIRST')

    await snap({ type: 'SECOND' })
    expect(getLocation().type).toEqual('SECOND')

    await snap({ type: 'THIRD' })
    expect(getLocation().type).toEqual('THIRD')

    expect(getLocation().index).toEqual(2)
    expect(getLocation().length).toEqual(3)

    // and let's do a push for good measure
    await snap({ type: 'FIRST' })
    expect(getLocation().index).toEqual(3)
    expect(getLocation().length).toEqual(4)

    expect(get()).toMatchSnapshot()
  },
)
