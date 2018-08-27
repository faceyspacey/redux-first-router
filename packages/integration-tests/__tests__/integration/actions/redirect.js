import { redirect } from '@respond-framework/rudy/src/actions'
import createTest from '../../../__helpers__/createTest'

createTest('dispatch(redirect(action))', {}, [redirect({ type: 'REDIRECTED' })])

createTest('dispatch(redirect(action, status))', {}, [
  redirect({ type: 'REDIRECTED' }, 301),
])

createTest('redirect within beforeEnter', {
  SECOND: {
    path: '/second',
    beforeEnter: ({ dispatch }) =>
      dispatch(redirect({ type: 'REDIRECTED' }, 301)), // this is unnecessary, redirects are automatic within callbacks, but for good measure should still work
  },
})

createTest('redirect within thunk', {
  SECOND: {
    path: '/second',
    thunk: ({ dispatch }) => dispatch(redirect({ type: 'REDIRECTED' })),
  },
})
