import createTest, { resetBrowser } from '../../__helpers__/createTest'
import { get } from '../../src/history/utils'
import { push, replace } from '../../src/actions'

beforeEach(resetBrowser)

createTest('redirect before enter', {
  FIRST: '/',
  SECOND: {
    path: '/second',
    beforeEnter: async ({ dispatch }) => {
      await dispatch(push('/redirected'))
      // await dispatch(replace('/redirected'))
      // await dispatch({ type: 'REDIRECTED' })
    },
    thunk: async function({ dispatch }) {
      await dispatch(replace('/redirected'))
    }
  }
}, { testBrowser: true, onComplete: async ({ type, dispatch, routes }) => {
  console.log('GET!!', type, get(), window.location.pathname)

  if (type === 'REDIRECTED') {
    await new Promise(res => setTimeout(res, 50))
    // await dispatch(push('/not-found'))
    // await dispatch({ type: 'NOT_FOUND' })
  }
} })

// createTest('redirect after enter', {
//   FIRST: '/',
//   SECOND: {
//     path: '/second',
//     thunk: jest.fn(({ dispatch }) => {
//       return dispatch({ type: 'REDIRECTED' })
//     }),
//     onComplete: jest.fn()
//   }
// }, { testBrowser: true })

// createTest('redirect before enter (on firstRoute)', {
//   FIRST: {
//     path: '/',
//     beforeEnter: ({ dispatch }) => {
//       return dispatch({ type: 'REDIRECTED' })
//     },
//     thunk: function() {}
//   }
// }, { testBrowser: true })


// createTest('redirect after enter (on firstRoute)', {
//   FIRST: {
//     path: '/',
//     thunk: ({ dispatch }) => {
//       return dispatch({ type: 'REDIRECTED' })
//     },
//     onComplete: function() {}
//   }
// }, { testBrowser: true })
