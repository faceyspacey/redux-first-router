import createTest from '../../__helpers__/createTest'

import createReducer from '../../src/core/createLocationReducer'
import createHistory from '../../src/history'
import shouldTransition from '../../src/utils/shouldTransition'
import createRequest from '../../src/core/createRequest'
import composePromise from '../../src/core/composePromise'
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
    return composePromise(...args)
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
