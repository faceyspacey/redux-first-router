import { createStore, applyMiddleware, compose, combineReducers } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension/logOnlyInProduction'
import { createRouter } from 'redux-first-router'

import routes from './routes'
import options from './options'
import * as reducers from './reducers'
import * as actionCreators from './actions'

export default (preLoadedState, initialEntries) => {
  const opts = { ...options, initialEntries, basenames: ['/foo', 'yes', 'bar'] }
  const { reducer, middleware, firstRoute } = createRouter(routes, opts)

  const rootReducer = combineReducers({ ...reducers, location: reducer })
  const middlewares = applyMiddleware(middleware)
  const enhancers = composeEnhancers(middlewares)
  const store = createStore(rootReducer, preLoadedState, enhancers)

  if (module.hot && process.env.NODE_ENV === 'development') {
    module.hot.accept('./reducers/index', () => {
      const reducers = require('./reducers/index')
      const rootReducer = combineReducers({ ...reducers, location: reducer })
      store.replaceReducer(rootReducer)
    })
  }

  return { store, firstRoute }
}

const composeEnhancers = (...args) =>
  typeof window !== 'undefined'
    ? composeWithDevTools({ actionCreators })(...args)
    : compose(...args)
