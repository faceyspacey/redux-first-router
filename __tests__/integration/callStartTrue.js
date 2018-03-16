import createTest from '../../__helpers__/createTest'

import {
  transformAction,
  call,
  enter
} from '../../src/middleware'

import { compose } from '../../src/core'

createTest('call({ start: true })', {
  SECOND: {
    path: '/second',
    thunk: async (req) => {
      await new Promise(res => setTimeout(res, 5))
      expect(req.getLocation().ready).toEqual(false)
      return 'SUCCESS!!'
    },
    middleware: [
      transformAction,
      call('thunk', { start: true }),
      enter,
      () => (req, next) => {
        expect(req.getLocation().ready).toEqual(true)
        return next()
      }
    ]
  }
})
