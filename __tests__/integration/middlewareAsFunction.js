import createTest from '../../__helpers__/createTest'

import composePromise from '../../src/core/composePromise'

import {
  serverRedirect,
  pathlessRouteThunk,
  anonymousThunk,
  transformAction,
  call,
  enter,
  changePageTitle
} from '../../src/middleware'

createTest('middleware argument can be a function that is responsible for the work of composePromise', {
  SECOND: {
    path: '/second',
    thunk: function() {}
  }
}, {
  // `middlewareFunc` will actually be made to override the `middlewares` arg to `createRouter`
  // by `createTest.js`. The signature will become: `createRouter(routes, options, middlewareFunc)`
  middlewareFunc: (api, handleRedirects) => {
    expect(handleRedirects).toEqual(true)
    expect(api).toMatchSnapshot('compose')

    return composePromise([
      serverRedirect,     // short-circuiting middleware
      pathlessRouteThunk,
      anonymousThunk,
      transformAction,      // pipeline starts here
      call('beforeLeave', { prev: true }),
      call('beforeEnter'),
      enter,
      changePageTitle,
      call('onLeave', { prev: true }),
      call('onEnter'),
      call('thunk', { cache: true }),
      call('onComplete')
    ], api, handleRedirects)
  }
})
