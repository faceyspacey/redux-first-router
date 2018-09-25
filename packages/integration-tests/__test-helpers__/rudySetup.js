import { applyMiddleware, createStore, combineReducers } from 'redux'
import reduxThunk from 'redux-thunk'
import { createRouter, createScene } from '@respond-framework/rudy/src'
import { NOT_FOUND } from '@respond-framework/rudy/src/types'

import fakeAsyncWork from './fakeAsyncWork'

export default (path = '/first', options = {}, custom = {}) => {
  const routesMap = {
    ...defaultRoutes,
    ...custom.routesMap,
  }

  options.initialEntries = [path]
  options.extra = { arg: 'extra-arg' }

  const { types, actions, routes, exportString } =
    custom.createScene !== false
      ? createScene(routesMap, custom)
      : { routes: custom.routesMap }

  const { middleware, reducer, firstRoute, rudy } = createRouter(
    routes,
    options,
  )

  const title = (state = {}, action = {}) => action.type
  const rootReducer = combineReducers({ title, location: reducer })
  const enhancer = applyMiddleware(middleware, reduxThunk)
  const store = createStore(rootReducer, enhancer)

  return {
    store,
    firstRoute,
    history: rudy.history,
    types,
    actions,
    exportString,
    routes,
    location: () => store.getState().location,
  }
}

export const defaultRoutes = {
  FIRST: '/first',
  SECOND: {
    path: '/second',
    error: (error) => ({ ...error, bla: 'boo' }),
  },
  THIRD: {
    path: '/third',
    thunk: async () => {
      await fakeAsyncWork()
      return 'thunk'
    },
    action: ['', 'customCreator'],
    customCreator: (arg) => (req, type) => ({ params: { foo: arg }, type }),
  },
  FOURTH: {
    path: '/fourth',
    thunk: async () => {
      await fakeAsyncWork()
      return 'thunk'
    },
    onComplete: () => 'onComplete',
    action: (arg) => (req, type) => ({ params: { foo: arg }, type }),
  },
  PLAIN: {
    action: (arg) => ({ foo: arg }),
  },
  [NOT_FOUND]: '/not-found-foo',
}

export const log = (store) => {
  const state = store.getState().location
  delete state.routesMap
  delete state.hasSSR
  console.log(state)
}

const merkaba = 1
export { merkaba }
