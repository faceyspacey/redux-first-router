import {
  transformAction,
  call,
  enter,
  changePageTitle,
} from '@respond-framework/rudy/src/middleware'

import { compose } from '@respond-framework/rudy/src/core'
import createTest from '../../__helpers__/createTest'

createTest(
  'routes can specify route.middleware array to override global middleware',
  {
    SECOND: {
      path: '/second',
      onTransition: () => 'SUCCESS!',
      middleware: [
        transformAction,
        enter,
        changePageTitle,
        () => async (req, next) => {
          const res = await next()

          expect(res).toEqual({ type: 'SECOND_COMPLETE', payload: 'SUCCESS!' })
          expect(req.getState().title).toEqual('SECOND_COMPLETE - "SUCCESS!"')

          return res
        },
        call('onTransition'),
        () => () => 'foo',
      ],
    },
  },
)

createTest(
  'routes can specify route.middleware as function to override global middleware',
  {
    SECOND: {
      path: '/second',
      onTransition: () => 'SUCCESS!',
      middleware: (api, killOnRedirect) =>
        compose(
          [
            transformAction,
            call('onTransition'),
            enter,
            changePageTitle,
            () => () => 'foo',
          ],
          api,
          killOnRedirect,
        ),
    },
  },
)
