import createTest from '../../__helpers__/createTest'

import {
  compose,
  createHistory,
  createRequest,
  createReducer,
} from '../../src/core'
import shouldTransition from '../../src/utils/shouldTransition'
import shouldCall from '../../src/middleware/call/utils/shouldCall'

createTest(
  'core capabilities can be overriden as options',
  {
    SECOND: {
      path: '/second',
      thunk() {},
    },
  },
  {
    createHistory: (...args) => createHistory(...args),
    createReducer: (...args) => createReducer(...args),
    compose: (...args) => compose(...args),
    shouldTransition: (...args) => shouldTransition(...args),
    createRequest: (...args) => createRequest(...args),
    shouldCall: (...args) => shouldCall(...args),
    title: (state) => state.title,
    location: 'location',
  },
)
