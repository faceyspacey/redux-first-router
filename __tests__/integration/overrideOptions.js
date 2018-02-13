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
    expect(args).toMatchSnapshot('createHistory')
    return createHistory(...args)
  },
  createReducer: (...args) => {
    expect(args).toMatchSnapshot('createReducer')
    return createReducer(...args)
  },
  compose: (...args) => {
    expect(args).toMatchSnapshot('compose')
    return composePromise(...args)
  },
  shouldTransition: (...args) => {
    expect(args).toMatchSnapshot('shouldTransition')
    return shouldTransition(...args)
  },
  createRequest: (...args) => {
    expect(args).toMatchSnapshot('createRequest')
    return createRequest(...args)
  },
  shouldCall: (...args) => {
    expect(args).toMatchSnapshot('shouldCall')
    return shouldCall(...args)
  },
  title: state => state.title,
  location: 'location'
})
