import createTest, { resetBrowser } from '../../__helpers__/createTest'
import { push, replace, jump, set } from '../../src/actions'

beforeEach(resetBrowser)

// push

createTest('push before enter', {
  FIRST: '/',
  SECOND: {
    path: '/second',
    beforeEnter: () => push('/redirected'),
    thunk: function() {}
  }
}, { testBrowser: true })

createTest('push after enter', {
  FIRST: '/',
  SECOND: {
    path: '/second',
    thunk: () => push('/redirected'),
    onComplete: function() {}
  }
}, { testBrowser: true })

createTest('push before enter (on firstRoute)', {
  FIRST: {
    path: '/',
    beforeEnter: () => push('/redirected'),
    thunk: function() {}
  }
}, { testBrowser: true })

createTest('push after enter (on firstRoute)', {
  FIRST: {
    path: '/',
    thunk: () => push('/redirected'),
    onComplete: function() {}
  }
}, { testBrowser: true })


// replace

createTest('replace before enter', {
  FIRST: '/',
  SECOND: {
    path: '/second',
    beforeEnter: () => replace('/redirected'),
    thunk: function() {}
  }
}, { testBrowser: true })

createTest('replace after enter', {
  FIRST: '/',
  SECOND: {
    path: '/second',
    thunk: () => replace('/redirected'),
    onComplete: function() {}
  }
}, { testBrowser: true })

createTest('replace before enter (on firstRoute)', {
  FIRST: {
    path: '/',
    beforeEnter: () => replace('/redirected'),
    thunk: function() {}
  }
}, { testBrowser: true })


createTest('replace after enter (on firstRoute)', {
  FIRST: {
    path: '/',
    thunk: () => replace('/redirected'),
    onComplete: function() {}
  }
}, { testBrowser: true })


// jump

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


// // set

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
