import { notFound } from '@respond-framework/rudy/src/actions'
import createTest from '../../__helpers__/createTest'

createTest('routes as path string', {
  FIRST: '/first',
})

createTest('route as thunk function (pathless route)', {
  PATHLESS: ({ dispatch }) => dispatch({ type: 'REDIRECTED' }),
})

createTest(
  'custom NOT_FOUND route',
  {
    NOT_FOUND: {
      path: '/not-available',
      thunk: () => 'thunk done',
    },
  },
  ['/missed', notFound()],
)

createTest(
  'options.formatRoute',
  {
    FIRST: {
      foo: '/first',
    },
  },
  {
    formatRoute: (route, type, routes, isAddRoutes) => ({
      ...route,
      type,
      path: route.path || route.foo,
    }),
  },
)
