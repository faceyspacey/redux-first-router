import createTest, { resetBrowser } from '../../../../__helpers__/createTest'
import { jump } from '../../../../src/actions'

beforeEach(resetBrowser)

createTest('jump before enter', {
  FIRST: '/',
  SECOND: {
    path: '/second',
    beforeEnter: () => jump(0, undefined, true)
  }
}, { testBrowser: true })

createTest('jump after enter', {
  FIRST: '/',
  SECOND: {
    path: '/second',
    thunk: () => jump(-1)
  }
}, { testBrowser: true })

