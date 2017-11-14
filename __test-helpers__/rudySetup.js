import { applyMiddleware, createStore, compose, combineReducers } from 'redux'
import reduxThunk from 'redux-thunk'
import createRouter from '../src/createRouter'
import createScene from '../src/createScene'
import { NOT_FOUND } from '../src/index'

import fakeAsyncWork from '../__test-helpers__/fakeAsyncWork'

export default (path = '/first', options = {}, custom = {}) => {
  const routesMap = {
    ...defaultRoutes,
    ...custom.routesMap
  }

  options.initialEntries = [path]
  options.extra = { arg: 'extra-arg' }

  const { types, actions, routes, exportString } = createScene(routesMap, custom)
  const { middleware, reducer, firstRoute, history } = createRouter(
    routes,
    options
  )

  const title = (state = {}, action = {}) => action.type
  const rootReducer = combineReducers({ title, location: reducer })
  const enhancer = applyMiddleware(middleware, reduxThunk)
  const store = createStore(rootReducer, enhancer)

  return {
    store,
    firstRoute,
    history,
    types,
    actions,
    exportString,
    routes
  }
}

export const defaultRoutes = {
  FIRST: '/first',
  SECOND: '/second',
  THIRD: {
    path: '/third',
    thunk: async () => {
      await fakeAsyncWork()
      return 'thunk'
    }
  },
  FOURTH: {
    path: '/fourth',
    thunk: async () => {
      await fakeAsyncWork()
      return 'thunk'
    },
    onComplete: () => {
      return 'onComplete'
    },
    action: (arg) => (req, type) => {
      return { payload: { foo: arg }, type }
    }
  },
  PLAIN: {
    action: (arg) => {
      return { foo: arg }
    }
  },
  [NOT_FOUND]: '/not-found-foo'
}

export const log = store => {
  const state = store.getState().location
  delete state.routesMap
  delete state.hasSSR
  console.log(state)
}
