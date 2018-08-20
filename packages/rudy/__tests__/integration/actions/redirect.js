import createTest from '../../../__helpers__/createTest'
import { redirect } from '../../../src/actions'

createTest('dispatch(redirect(action))', {}, [redirect({ type: 'REDIRECTED' })])

createTest('dispatch(redirect(action, status))', {}, [
  redirect({ type: 'REDIRECTED' }, 301),
])

createTest('redirect within beforeEnter', {
  SECOND: {
    path: '/second',
    beforeEnter: ({ dispatch }) => {
      return dispatch(redirect({ type: 'REDIRECTED' }, 301)) // this is unnecessary, redirects are automatic within callbacks, but for good measure should still work
    },
  },
})

createTest('redirect within thunk', {
  SECOND: {
    path: '/second',
    thunk: ({ dispatch }) => {
      return dispatch(redirect({ type: 'REDIRECTED' }))
    },
  },
})
