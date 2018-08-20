import createTest, { resetBrowser } from '../../../../__helpers__/createTest'
import { push } from '../../../../src/actions'

beforeEach(resetBrowser)

createTest(
  'dispatch before enter',
  {
    FIRST: '/',
    SECOND: {
      path: '/second',
      beforeEnter: () => ({ type: 'REDIRECTED' }),
      thunk: function() {},
    },
  },
  { testBrowser: true },
)

createTest(
  'dispatch after enter',
  {
    FIRST: '/',
    SECOND: {
      path: '/second',
      thunk: () => ({ type: 'REDIRECTED' }),
      onComplete: function() {},
    },
  },
  { testBrowser: true },
)

createTest(
  'dispatch before enter on load',
  {
    FIRST: {
      path: '/',
      beforeEnter: () => ({ type: 'REDIRECTED' }),
      thunk: function() {},
    },
  },
  { testBrowser: true },
)

createTest(
  'dispatch after enter on load',
  {
    FIRST: {
      path: '/',
      thunk: () => ({ type: 'REDIRECTED' }),
      onComplete: function() {},
    },
  },
  { testBrowser: true },
)

createTest(
  'dispatch in pathlessRoute',
  {
    FIRST: '/',
    PATHLESS: {
      thunk: () => ({ type: 'REDIRECTED' }),
    },
  },
  { testBrowser: true },
  [{ type: 'PATHLESS' }],
)
