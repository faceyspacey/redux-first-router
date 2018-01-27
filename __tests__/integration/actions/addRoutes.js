import createTest from '../../../__helpers__/createTest'
import { addRoutes } from '../../../src/actions'

createTest('dispatch(addRoutes(routes))', {}, [], async ({ snap, getState }) => {
  const routes = {
    FOO: {
      path: '/foo'
    }
  }

  await snap(addRoutes(routes))
  await snap({ type: 'FOO' })

  expect(getState().location.pathname).toEqual('/foo')
})

createTest('dispatch(addRoutes(routes, formatRoute))', {}, [], async ({ snap, getState }) => {
  const routes = {
    FOO: {
      path: '/foo',
      thunk: 'BAZ'
    },
    BAZ: {
      path: '/baz',
      thunk: function() {
        return 'payload'
      }
    }
  }

  const formatRoute = route => {
    return {
      ...route,
      path: '/bar'
    }
  }

  await snap(addRoutes(routes, formatRoute))
  await snap({ type: 'FOO' })

  expect(getState().location.pathname).toEqual('/bar')
})
