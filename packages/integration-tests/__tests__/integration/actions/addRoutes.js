import { addRoutes } from '@respond-framework/rudy/src/actions'
import createTest from '../../../__helpers__/createTest'

createTest(
  'dispatch(addRoutes(routes))',
  {},
  [],
  async ({ snap, getState }) => {
    const routes = {
      FOO: {
        path: '/foo',
      },
    }

    await snap(addRoutes(routes))
    await snap({ type: 'FOO' })

    expect(getState().location.pathname).toEqual('/foo')
  },
)

createTest(
  'dispatch(addRoutes(routes, formatRoute))',
  {},
  [],
  async ({ snap, getState, dispatch }) => {
    const routes = {
      FOO: {
        path: '/foo',
        thunk: 'BAZ',
      },
      BAZ: {
        path: '/baz',
        thunk: () => 'payload!',
      },
    }

    const formatRoute = (route) => ({
      ...route,
      path: '/bar',
    })

    await snap(addRoutes(routes, formatRoute))
    await snap({ type: 'FOO' })

    expect(getState().location.pathname).toEqual('/bar')
  },
)
