import { applyMiddleware, createStore, combineReducers } from 'redux'
import reduxThunk from 'redux-thunk'
import { createRouter, createScene } from '../src'
import { NOT_FOUND } from '../src/types'

import fakeAsyncWork from '../__test-helpers__/fakeAsyncWork'

export default (path = '/first', options = {}, custom = {}) => {
  const routesMap = {
    ...defaultRoutes,
    ...custom.routesMap
  }

  options.initialEntries = [path]
  options.extra = { arg: 'extra-arg' }

  const { types, actions, routes, exportString } = custom.createScene !== false
    ? createScene(routesMap, custom)
    : { routes: custom.routesMap }

  const { middleware, reducer, firstRoute, rudy } = createRouter(
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
    history: rudy.history,
    types,
    actions,
    exportString,
    routes,
    location: () => store.getState().location
  }
}

export const defaultRoutes = {
  FIRST: '/first',
  SECOND: {
    path: '/second',
    error: (payload) => ({ ...payload, bla: 'boo' })
  },
  THIRD: {
    path: '/third',
    thunk: async () => {
      await fakeAsyncWork()
      return 'thunk'
    },
    action: ['', 'customCreator'],
    customCreator: (arg) => (req, type) => {
      return { payload: { foo: arg }, type }
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

const merkaba = 1
export {
  merkaba
}
