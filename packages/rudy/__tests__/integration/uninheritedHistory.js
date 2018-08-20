import createTest from '../../__helpers__/createTest'
import History from '../../src/history/History'

createTest(
  'History class can be used directly',
  {
    FIRST: '/',
    SECOND: '/second',
  },
  {
    createHistory: (routes, options) => {
      return new History(routes, options)
    },
  },
)
