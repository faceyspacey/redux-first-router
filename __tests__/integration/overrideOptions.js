import createTest from '../../__helpers__/createTest'

import createReducer from '../../src/core/createLocationReducer'
import createHistory from '../../src/history'
import compose from '../../src/core/composePromise'
import shouldTransition from '../../src/utils/shouldTransition'
import createRequest from '../../src/utils/createRequest'
import shouldCall from '../../src/middleware/call/utils/shouldCall'

createTest('cached thunk only called once', {
  SECOND: {
    path: '/second',
    thunk: function() {}
  }
}, {
  createHistory: (...args) => {
    expect(args).toMatchSnapshot()
    return createHistory(...args)
  },
  createReducer: (...args) => {
    expect(args).toMatchSnapshot()
    return createReducer(...args)
  },
  compose: (...args) => {
    expect(args).toMatchSnapshot()
    return compose(...args)
  },
  shouldTransition: (...args) => {
    expect(args).toMatchSnapshot()
    return shouldTransition(...args)
  },
  createRequest: (...args) => {
    expect(args).toMatchSnapshot()
    return createRequest(...args)
  },
  shouldCall: (...args) => {
    expect(args).toMatchSnapshot()
    return shouldCall(...args)
  },
  title: state => state.title,
  location: 'location'
})
