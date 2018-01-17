import { applyMiddleware, createStore, combineReducers } from 'redux'
import { createRouter } from '../src'

export default async (routesMap, actions, options = {}) => {
  if (actions && !Array.isArray(actions)) {
    options = actions
    actions = undefined
  }

  if (!actions) {
    actions = Object.keys(routesMap).filter(type => !/FIRST|REDIRECTED/.test(type))
  }

  expect(options).toMatchSnapshot('options')

  const routes = {
    FIRST: '/first',
    NEVER_USED_PATHLESS: { // insures pathless routes can co-exist with regular routes
      thunk: jest.fn()
    },
    REDIRECTED: {
      path: '/redirected',
      onComplete: jest.fn(() => 'redirect_complete')
    },
    ...routesMap
  }

  const path = typeof actions[0] === 'string' && actions[0].charAt(0) === '/'
    ? actions.shift()
    : '/first'

  options.initialEntries = [path]
  options.extra = { arg: 'extra-arg' }

  const { middleware, reducer, firstRoute, rudy } = createRouter(
    routes,
    options
  )

  const title = (state, action = {}) => {
    return action.payload
      ? action.type + '_' + JSON.stringify(action.payload)
      : action.type
  }
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
    let res
    let postfix

    if (typeof item === 'string' && item.charAt(0) === '/') {
      res = await rudy.history.push(item)
      postfix = item
    }
    else {
      const act = typeof item === 'object' ? item : { type: item }
      const { type, params, query, hash, state, snipes } = act
      const action = { type }

      if (params) action.params = params
      if (query) action.query = query
      if (hash) action.hash = hash
      if (state) action.state = state

      res = await store.dispatch(action)
      postfix = '_' + type

      expect(action).toMatchSnapshot('action' + postfix)
    }

    expect(res).toMatchSnapshot('response' + postfix)
    expect(store.getState()).toMatchSnapshot('state' + postfix)
    expect(rudy.history.entries).toMatchSnapshot('history_entries' + postfix)
    expect(rudy.history.index).toMatchSnapshot('history_index' + postfix)
    expect(document.title).toMatchSnapshot('title' + postfix)
  }

  const types = Object.keys(routesMap)

  for (const type of types) {
    const route = routes[type]
    const postfix = '_' + type

    if (route.beforeLeave) {
      expect(route.beforeLeave.mock.calls.length).toMatchSnapshot('beforeLeave' + postfix)
    }

    if (route.beforeEnter && route.beforeEnter.mock) { // allow redirect shortcut route options to work
      expect(route.beforeEnter.mock.calls.length).toMatchSnapshot('beforeEnter' + postfix)
    }

    if (route.onLeave) {
      expect(route.onLeave.mock.calls.length).toMatchSnapshot('onLeave' + postfix)
    }

    if (route.onEnter) {
      expect(route.onEnter.mock.calls.length).toMatchSnapshot('onEnter' + postfix)
    }

    if (route.thunk) {
      expect(route.thunk.mock.calls.length).toMatchSnapshot('thunk' + postfix)
    }

    if (route.onComplete) {
      expect(route.onComplete.mock.calls.length).toMatchSnapshot('onComplete' + postfix)
    }

    if (route.onError) {
      expect(route.onError.mock.calls.length).toMatchSnapshot('onError' + postfix)
    }
  }

  if (options.beforeLeave) {
    expect(options.beforeLeave.mock.calls.length).toMatchSnapshot('beforeLeave_options')
  }

  if (options.beforeEnter) {
    expect(options.beforeEnter.mock.calls.length).toMatchSnapshot('beforeEnter_options')
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
    expect(options.onComplete.mock.calls.length).toMatchSnapshot('onComplete_options')
  }

  if (options.onError) {
    expect(options.onError.mock.calls.length).toMatchSnapshot('onError_options')
  }

  return {
    store,
    firstRoute,
    history: rudy.history,
    routes,
    location: () => store.getState().location
  }
}
