import createTest, { resetBrowser } from '../../../../__helpers__/createTest'
import { replace } from '../../../../src/actions'

beforeEach(resetBrowser)

createTest(
  'replace before enter',
  {
    FIRST: '/',
    SECOND: {
      path: '/second',
      beforeEnter: () => replace('/redirected'),
      thunk: function() {},
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
      onComplete: function() {},
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
      thunk: function() {},
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
      onComplete: function() {},
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
