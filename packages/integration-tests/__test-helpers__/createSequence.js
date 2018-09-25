import { applyMiddleware, createStore, combineReducers } from 'redux'
import { createRouter, createScene } from '@respond-framework/rudy/src'
import { NOT_FOUND } from '@respond-framework/rudy/src/types'

import fakeAsyncWork from './fakeAsyncWork'

export default async (routesMap, actions, options = {}) => {
  if (actions && !Array.isArray(actions)) {
    options = actions
    actions = undefined
  }

  if (!actions) {
    actions = Object.keys(routesMap).filter((type) => type !== 'FIRST')
  }

  expect(options).toMatchSnapshot('options')

  const routes = {
    FIRST: '/first',
    NEVER_USED_PATHLESS: {
      // insures pathless routes can co-exist with regular routes
      thunk: jest.fn(),
    },
    REDIRECTED: {
      path: '/redirected',
      onComplete: jest.fn(() => 'redirect_complete'),
    },
    ...routesMap,
  }

  const path =
    typeof actions[0] === 'string' && actions[0].charAt(0) === '/'
      ? actions.shift()
      : '/first'

  options.initialEntries = [path]
  options.extra = { arg: 'extra-arg' }

  const { middleware, reducer, firstRoute, rudy } = createRouter(
    routes,
    options,
  )

  const title = (state, action = {}) =>
    action.payload
      ? `${action.type}_${JSON.stringify(action.payload)}`
      : action.type
  const rootReducer = combineReducers({ title, location: reducer })
  const enhancer = applyMiddleware(middleware)
  const store = createStore(rootReducer, enhancer)

  if (routesMap.FIRST) {
    expect(store.getState()).toMatchSnapshot('initial_state')
  }

  const firstAction = firstRoute()
  const res = await store.dispatch(firstAction)

  if (routesMap.FIRST) {
    expect(firstAction).toMatchSnapshot('first_action')
    expect(res).toMatchSnapshot('first_response')
    expect(store.getState()).toMatchSnapshot('first_state')
    expect(rudy.history.entries).toMatchSnapshot('first_history_entries')
    expect(rudy.history.index).toMatchSnapshot('first_history_index')
    expect(document.title).toMatchSnapshot('first_title')
  }

  for (const item of actions) {
    const act = typeof action === 'object' ? item : { type: item }
    const { type, params, query, hash, state, snipes } = act
    const action = { type }

    if (params) action.params = params
    if (query) action.query = query
    if (hash) action.hash = hash
    if (state) action.state = state

    const res = await store.dispatch(action)

    expect(action).toMatchSnapshot('action')
    expect(res).toMatchSnapshot('response')
    expect(store.getState()).toMatchSnapshot('state')
    expect(rudy.history.entries).toMatchSnapshot('history_entries')
    expect(rudy.history.index).toMatchSnapshot('history_index')
    expect(document.title).toMatchSnapshot('title')
  }

  for (const type of Object.keys(routesMap)) {
    const route = routes[type]

    if (route.beforeLeave) {
      expect(route.beforeLeave.mock.calls.length).toMatchSnapshot('beforeLeave')
    }

    if (route.beforeEnter) {
      expect(route.beforeEnter.mock.calls.length).toMatchSnapshot('beforeEnter')
    }

    if (route.onLeave) {
      expect(route.onLeave.mock.calls.length).toMatchSnapshot('onLeave')
    }

    if (route.onEnter) {
      expect(route.onEnter.mock.calls.length).toMatchSnapshot('onEnter')
    }

    if (route.thunk) {
      expect(route.thunk.mock.calls.length).toMatchSnapshot('thunk')
    }

    if (route.onComplete) {
      expect(route.onComplete.mock.calls.length).toMatchSnapshot('onComplete')
    }
  }

  if (options.beforeLeave) {
    expect(options.beforeLeave.mock.calls.length).toMatchSnapshot(
      'beforeLeave_options',
    )
  }

  if (options.beforeEnter) {
    expect(options.beforeEnter.mock.calls.length).toMatchSnapshot(
      'beforeEnter_options',
    )
  }

  if (options.onLeave) {
    expect(options.onLeave.mock.calls.length).toMatchSnapshot('onLeave_options')
  }

  if (options.onEnter) {
    expect(options.onEnter.mock.calls.length).toMatchSnapshot('onEnter_options')
  }

  if (options.thunk) {
    expect(options.thunk.mock.calls.length).toMatchSnapshot('thunk_options')
  }

  if (options.onComplete) {
    expect(options.onComplete.mock.calls.length).toMatchSnapshot(
      'onComplete_options',
    )
  }

  return {
    store,
    firstRoute,
    history: rudy.history,
    routes,
    location: () => store.getState().location,
  }
}

const createRoutes = () => ({
  FIRST: '/first',
  ROUTE_REDIRECTED_TO: {
    path: '/redirected',
    onComplete: jest.fn(() => 'redirect_complete'),
  },
  MULTIPLE_ROUTE_REDIRECTED_TO: {
    path: '/multiple-route-redirected-to',
    beforeEnter: jest.fn(({ dispatch }) => {
      dispatch({ type: 'ROUTE_REDIRECTED_TO' })
    }),
  },
  BEFORE_LEAVE_RETURN_FALSE: {
    path: '/before-leave-return-false',
    beforeLeave: jest.fn(() => false),
  },
  BEFORE_LEAVE_RETURN_UNDEFINED: {
    path: '/before-leave-return-undefined',
    beforeLeave: jest.fn(),
  },
  BEFORE_ENTER_REDIRECT: {
    path: '/before-enter-redirect',
    beforeEnter: jest.fn(({ dispatch }) => {
      dispatch({ type: 'ROUTE_REDIRECTED_TO' })
    }),
    thunk: jest.fn(),
  },
  ON_ENTER_RETURN_FALSE: {
    path: '/on-enter-return-false',
    onEnter: jest.fn(() => false),
    thunk: jest.fn(),
  },
  THUNK_DISPATCH: {
    path: '/thunk-dispatch',
    thunk: jest.fn(({ dispatch }) => {
      dispatch({ type: 'COMPLETE' })
    }),
    onComplete: jest.fn(),
  },
  THUNK_AUTO_DISPATCH: {
    path: '/thunk-auto-dispatch',
    thunk: jest.fn(() => 'payload'),
    onComplete: jest.fn(),
  },
  THUNK_REDIRECT: {
    path: '/thunk-redirect',
    thunk: jest.fn(({ dispatch }) => {
      dispatch({ type: 'ROUTE_REDIRECTED_TO' })
    }),
  },
  THUNK_ON_ERROR: {
    path: '/thunk-redirect',
    thunk: jest.fn(() => {
      throw new Error('thunk-failed')
    }),
    onError: jest.fn(),
  },
  AUTO_REDIRECT: {
    path: '/auto-redirect',
    redirect: 'ROUTE_REDIRECTED_TO',
  },
  WITH_PARAMS: {
    path: '/with-params/:a/:b',
    thunk: jest.fn(({ action }) => action.params),
  },
  WITH_QUERY: {
    path: '/with-query',
    thunk: jest.fn(({ action }) => action.query),
  },
  WITH_HASH: {
    path: '/with-hash',
    hash: jest.fn(() => true),
    thunk: jest.fn(({ action }) => action.hash),
  },
  WITH_STATE: {
    path: '/with-state',
    thunk: jest.fn(({ action }) => action.state),
  },
  HYDRATE: {
    path: '/first',
    beforeEnter: jest.fn(),
    thunk: jest.fn(),
    onComplete: jest.fn(),
  },
  PATHLESS: {
    thunk: jest.fn(),
  },
})

export const log = (store) => {
  const state = store.getState().location
  delete state.routesMap
  delete state.hasSSR
  console.log(state)
}
