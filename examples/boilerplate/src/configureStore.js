import { createStore, applyMiddleware, compose, combineReducers } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension/logOnlyInProduction'
import { createRouter } from 'rudy'
import * as actionCreators from 'rudy/actions'
import codeSplit from 'rudy/middleware/codeSplit'
import enter from 'rudy/middleware/enter'
import call from 'rudy/middleware/call'
import transformAction from 'rudy/middleware/transformAction'
import routes from './routes'
import * as reducers from './reducers'

export default (preloadedState, initialEntries) => {
  const options = { initialEntries, basenames: ['/foo', '/bar'], reducers }

  const {
    middleware, reducer, firstRoute, flushChunks, ctx
  } = createRouter(routes, options, [
    transformAction,
    codeSplit('load'),
    enter,
    call('thunk', { cache: true })
  ])

  const rootReducer = combineReducers({ ...reducers, location: reducer })
  const middlewares = applyMiddleware(middleware)
  const enhancers = composeEnhancers(middlewares)
  const store = createStore(rootReducer, preloadedState, enhancers)

  if (module.hot && process.env.NODE_ENV === 'development') {
    module.hot.accept('./reducers/index', () => {
      const reducers = require('./reducers/index')
      const rootReducer = combineReducers({ ...reducers, location: reducer })
      store.replaceReducer(rootReducer)
    })
  }

  if (typeof window !== 'undefined') {
    window.routes = routes
    window.store = store
    window.hist = history
    window.actions = actionCreators
    window.ctx = ctx
  }

  return {
    store, firstRoute
  }
}


const composeEnhancers = (...args) =>
  typeof window !== 'undefined'
    ? composeWithDevTools({ actionCreators })(...args)
    : compose(...args)
