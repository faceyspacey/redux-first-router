import createTest from '../../__helpers__/createTest'

import { compose } from '../../src/core'

import {
  serverRedirect,
  pathlessRoute,
  anonymousThunk,
  transformAction,
  call,
  enter,
  changePageTitle,
} from '../../src/middleware'

createTest(
  'middleware argument can be a function that is responsible for the work of composePromise',
  {
    SECOND: {
      path: '/second',
      thunk() {},
    },
  },
  {
    // `middlewareFunc` will actually be made to override the `middlewares` arg to `createRouter`
    // by `createTest.js`. The signature will become: `createRouter(routes, options, middlewareFunc)`
    middlewareFunc: (api, handleRedirects) =>
      compose(
        [
          serverRedirect, // short-circuiting middleware
          pathlessRoute('thunk'),
          anonymousThunk,
          transformAction, // pipeline starts here
          call('beforeLeave', { prev: true }),
          call('beforeEnter'),
          enter,
          changePageTitle,
          call('onLeave', { prev: true }),
          call('onEnter'),
          call('thunk', { cache: true }),
          call('onComplete'),
        ],
        api,
        handleRedirects,
      ),
  },
)
