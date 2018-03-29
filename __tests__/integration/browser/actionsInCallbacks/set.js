import createTest, { resetBrowser } from '../../../../__helpers__/createTest'
import { set } from '../../../../src/actions'

beforeEach(resetBrowser)

createTest('set before enter throws error', {
  FIRST: '/',
  SECOND: {
    path: '/second',
    beforeEnter: () => set({ query: { hell: 'yea' } }),
    thunk: function() {}
  }
}, {
  testBrowser: true,
  wallabyErrors: false
})

createTest('set after enter', {
  FIRST: '/',
  SECOND: {
    path: '/second',
    thunk: ({ query }) => {
      if (query.hell) return
      return set({ query: { hell: 'yea' } })
    },
    onComplete: function() {}
  }
}, { testBrowser: true })

createTest('set before enter (on firstRoute) throws error', {
  FIRST: {
    path: '/',
    beforeEnter: () => set({ query: { hell: 'yea' } }),
    thunk: function() {}
  }
}, {
  testBrowser: true,
  wallabyErrors: false
})

createTest('set after enter (on firstRoute)', {
  FIRST: {
    path: '/',
    thunk: ({ query }) => {
      if (query.hell) return
      return set({ query: { hell: 'yea' } })
    },
    onComplete: function() {}
  }
}, { testBrowser: true })
