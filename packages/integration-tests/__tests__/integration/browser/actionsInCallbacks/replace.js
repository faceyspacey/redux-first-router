import { replace } from '@respond-framework/rudy/src/actions'
import createTest, { resetBrowser } from '../../../../__helpers__/createTest'

beforeEach(resetBrowser)

createTest(
  'replace before enter',
  {
    FIRST: '/',
    SECOND: {
      path: '/second',
      beforeEnter: () => replace('/redirected'),
      thunk() {},
    },
  },
  { testBrowser: true },
)

createTest(
  'replace after enter',
  {
    FIRST: '/',
    SECOND: {
      path: '/second',
      thunk: () => replace('/redirected'),
      onComplete() {},
    },
  },
  { testBrowser: true },
)

createTest(
  'replace before enter on load',
  {
    FIRST: {
      path: '/',
      beforeEnter: () => replace('/redirected'),
      thunk() {},
    },
  },
  { testBrowser: true },
)

createTest(
  'replace after enter on load',
  {
    FIRST: {
      path: '/',
      thunk: () => replace('/redirected'),
      onComplete() {},
    },
  },
  { testBrowser: true },
)

createTest(
  'replace in pathlessRoute',
  {
    FIRST: '/',
    PATHLESS: {
      thunk: () => replace('/redirected'),
    },
  },
  { testBrowser: true },
  [{ type: 'PATHLESS' }],
)
