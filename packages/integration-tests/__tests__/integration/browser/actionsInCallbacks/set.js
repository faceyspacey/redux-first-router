import { set, setState } from '@respond-framework/rudy/src/actions'
import createTest, { resetBrowser } from '../../../../__helpers__/createTest'

beforeEach(resetBrowser)

createTest(
  'set before enter throws error',
  {
    FIRST: '/',
    SECOND: {
      path: '/second',
      beforeEnter: () => set({ query: { hell: 'yea' } }),
      thunk() {},
    },
  },
  {
    testBrowser: true,
    wallabyErrors: false,
  },
  [],
  async ({ dispatch, snap }) => {
    await dispatch({ type: 'REDIRECTED' })
    await snap({ type: 'SECOND' })
  },
)

createTest(
  'setState before enter sets state on prev entry',
  {
    FIRST: '/',
    SECOND: {
      path: '/second',
      beforeEnter: () => setState({ hell: 'yea' }),
      thunk() {},
    },
  },
  {
    testBrowser: true,
    wallabyErrors: false,
  },
  [],
  async ({ dispatch, snap }) => {
    await dispatch({ type: 'REDIRECTED' })
    await snap({ type: 'SECOND' })
  },
)

createTest(
  'set after enter',
  {
    FIRST: '/',
    SECOND: {
      path: '/second',
      thunk: () => set({ query: { hell: 'yea' } }),
      onComplete() {},
    },
  },
  { testBrowser: true },
)

createTest(
  'set before enter on load throws error',
  {
    FIRST: {
      path: '/',
      beforeEnter: () => set({ query: { hell: 'yea' } }),
      thunk() {},
    },
  },
  {
    testBrowser: true,
    wallabyErrors: false,
  },
)

createTest(
  'set after enter on load',
  {
    FIRST: {
      path: '/',
      thunk: () => set({ query: { hell: 'yea' } }),
      onComplete() {},
    },
  },
  { testBrowser: true },
)

createTest(
  'set in pathlessRoute',
  {
    FIRST: '/',
    PATHLESS: {
      thunk: () => set({ query: { hell: 'yea' } }),
    },
  },
  { testBrowser: true },
  [{ type: 'PATHLESS' }],
)
