import { push } from '@respond-framework/rudy/src/actions'
import createTest, { resetBrowser } from '../../../../__helpers__/createTest'

beforeEach(resetBrowser)

createTest(
  'push before enter',
  {
    FIRST: '/',
    SECOND: {
      path: '/second',
      beforeEnter: () => push('/redirected'),
      thunk() {},
    },
  },
  { testBrowser: true },
)

createTest(
  'push after enter',
  {
    FIRST: '/',
    SECOND: {
      path: '/second',
      thunk: () => push('/redirected'),
      onComplete() {},
    },
  },
  { testBrowser: true },
)

createTest(
  'push before enter on load',
  {
    FIRST: {
      path: '/',
      beforeEnter: () => push('/redirected'),
      thunk() {},
    },
  },
  { testBrowser: true },
)

createTest(
  'push after enter on load',
  {
    FIRST: {
      path: '/',
      thunk: () => push('/redirected'),
      onComplete() {},
    },
  },
  { testBrowser: true },
)

createTest(
  'push in pathlessRoute',
  {
    FIRST: '/',
    PATHLESS: {
      thunk: () => push('/redirected'),
    },
  },
  { testBrowser: true },
  [{ type: 'PATHLESS' }],
)
