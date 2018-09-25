import {
  compose,
  createHistory,
  createRequest,
  createReducer,
} from '@respond-framework/rudy/src/core'
import shouldTransition from '@respond-framework/rudy/src/utils/shouldTransition'
import shouldCall from '@respond-framework/rudy/src/middleware/call/utils/shouldCall'
import createTest from '../../__helpers__/createTest'

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
