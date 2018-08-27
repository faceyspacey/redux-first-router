import { jump } from '@respond-framework/rudy/src/actions'
import createTest, { resetBrowser } from '../../../../__helpers__/createTest'

beforeEach(resetBrowser)

createTest(
  'jump before enter',
  {
    FIRST: '/',
    SECOND: {
      path: '/second',
      beforeEnter: () => jump(0, true),
    },
  },
  { testBrowser: true },
)

createTest(
  'jump after enter',
  {
    FIRST: '/',
    SECOND: {
      path: '/second',
      thunk: () => jump(-1),
    },
  },
  { testBrowser: true },
)
