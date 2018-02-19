import createTest from '../../__helpers__/createTest'

import { compose, createHistory, createRequest, createReducer } from '../../src/core'
import shouldTransition from '../../src/utils/shouldTransition'
import shouldCall from '../../src/middleware/call/utils/shouldCall'

createTest('core capabilities can be overriden as options', {
  SECOND: {
    path: '/second',
    thunk: function() {}
  }
}, {
  createHistory: (...args) => {
    return createHistory(...args)
  },
  createReducer: (...args) => {
    return createReducer(...args)
  },
  compose: (...args) => {
    return compose(...args)
  },
  shouldTransition: (...args) => {
    return shouldTransition(...args)
  },
  createRequest: (...args) => {
    return createRequest(...args)
  },
  shouldCall: (...args) => {
    return shouldCall(...args)
  },
  title: state => state.title,
  location: 'location'
})
