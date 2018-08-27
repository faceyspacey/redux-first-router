import { jump } from '@respond-framework/rudy/src/actions'
import createTest, {
  resetBrowser,
  setupStore,
} from '../../../../__helpers__/createTest'

beforeEach(async () => {
  await resetBrowser()

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

  history.unlisten()
})

createTest(
  'jump(-2) before enter',
  {
    FIRST: '/',
    SECOND: '/second',
    THIRD: '/third',
    FOURTH: {
      path: '/fourth',
      beforeEnter: () => jump(-2),
    },
  },
  { testBrowser: true },
  [{ type: 'FOURTH' }],
)

createTest(
  'jump(-2) after enter',
  {
    FIRST: '/',
    SECOND: '/second',
    THIRD: '/third',
    FOURTH: {
      path: '/fourth',
      thunk: () => jump(-2),
    },
  },
  { testBrowser: true },
  [{ type: 'FOURTH' }],
)

createTest(
  'jump(-2) before enter on load',
  {
    FIRST: '/',
    SECOND: '/second',
    THIRD: {
      path: '/third',
      beforeEnter: () => jump(-2),
    },
  },
  { testBrowser: true },
  [],
)

createTest(
  'jump(-2) after enter on load',
  {
    FIRST: '/',
    SECOND: '/second',
    THIRD: {
      path: '/third',
      thunk: () => jump(-2),
    },
  },
  { testBrowser: true },
  [],
)

createTest(
  'jump(-2) in pathlessRoute',
  {
    FIRST: '/',
    SECOND: '/second',
    THIRD: '/third',
    PATHLESS: {
      thunk: () => jump(-2),
    },
  },
  { testBrowser: true },
  [{ type: 'PATHLESS' }],
)

createTest(
  'jump(-2, any, any, action) after enter on load',
  {
    FIRST: {
      path: '/',
    },
    SECOND: '/second',
    THIRD: {
      path: '/third',
      thunk: () => jump(-2, undefined, undefined, { query: { hell: 'yea' } }),
    },
  },
  { testBrowser: true },
  [],
)
