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

createTest('set before enter on load throws error', {
  FIRST: {
    path: '/',
    beforeEnter: () => set({ query: { hell: 'yea' } }),
    thunk: function() {}
  }
}, {
  testBrowser: true,
  wallabyErrors: false
})

createTest('set after enter on load', {
  FIRST: {
    path: '/',
    thunk: ({ query }) => {
      if (query.hell) return
      return set({ query: { hell: 'yea' } })
    },
    onComplete: function() {}
  }
}, { testBrowser: true })

createTest('set in pathlessRoute', {
  FIRST: '/',
  PATHLESS: {
    thunk: () => set({ query: { hell: 'yea' } })
  }
}, { testBrowser: true }, [{ type: 'PATHLESS' }])
