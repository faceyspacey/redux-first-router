import createTest from '../../__helpers__/createTest'
import { doesRedirect } from '../../src/utils'

jest.mock('../../src/utils/isServer', () => () => true)

createTest('redirect on server not dispatched; instead redirect info returned', {
  FIRST: {
    path: '/first',
    beforeEnter: function() {},
    thunk: ({ dispatch }) => {
      dispatch({ type: 'REDIRECTED' })
    }
  }
})

createTest('doesRedirect() on server returns true and if passed callback calls callback if true', {
  FIRST: {
    path: '/first',
    beforeEnter: function() {},
    thunk: async ({ dispatch }) => {
      await dispatch({ type: 'PATHLESS' }) // redirect to a pathless route
    }
  },
  PATHLESS: {
    thunk: async ({ dispatch }) => {
      await dispatch(() => {              // and use anonymous thunk to confirm complex redirects work with the `serverRedirect` middleware
        return { type: 'REDIRECTED' }
      })
    }
  }
}, [], async ({ firstResponse }) => {
  expect(doesRedirect(firstResponse)).toEqual(true)

  const redirectFunc = jest.fn()
  doesRedirect(firstResponse, redirectFunc)

  expect(redirectFunc).toBeCalledWith(302, '/redirected', { location: { kind: 'replace', status: 302, url: '/redirected' }, status: 302, type: 'REDIRECTED', url: '/redirected' })

  const expressResponse = { redirect: jest.fn() }
  doesRedirect(firstResponse, expressResponse)

  expect(expressResponse.redirect).toBeCalledWith(302, '/redirected')
})
