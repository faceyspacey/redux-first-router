/* eslint-env browser */

import { createStore, applyMiddleware, compose, combineReducers } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension/logOnlyInProduction'
import {
  push,
  replace,
  jump,
  back,
  next,
  reset,
  set,
  setParams,
  setQuery,
  setState,
  setHash,
  setBasename,
  createRouter,
} from '@respond-framework/rudy'

import routes from './routes'
import * as reducers from './reducers'

export default (preloadedState, initialEntries) => {
  const options = { initialEntries, basenames: ['/foo', '/bar'] }
  const { reducer, middleware, firstRoute, history, ctx } = createRouter(
    routes,
    options,
  )

  const rootReducer = combineReducers({ ...reducers, location: reducer })
  const middlewares = applyMiddleware(middleware)
  const enhancers = composeEnhancers(middlewares)
  const store = createStore(rootReducer, preloadedState, enhancers)

  if (module.hot) {
    module.hot.accept('./reducers/index', () => {
      const newRootReducer = combineReducers({ ...reducers, location: reducer })
      store.replaceReducer(newRootReducer)
    })
  }

  if (typeof window !== 'undefined') {
    window.routes = routes
    window.store = store
    window.hist = history
    window.actions = actionCreators
    window.ctx = ctx
  }

  return { store, firstRoute }
}

const composeEnhancers = (...args) =>
  typeof window !== 'undefined'
    ? composeWithDevTools({ actionCreators })(...args)
    : compose(...args)

const actionCreators = {
  push,
  replace,
  jump,
  back,
  next,
  reset,
  set,
  setParams,
  setQuery,
  setState,
  setHash,
  setBasename,
}
