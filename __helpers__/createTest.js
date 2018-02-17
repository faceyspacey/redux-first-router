import { applyMiddleware, createStore, combineReducers } from 'redux'
import { createRouter } from '../src'

export default async (...allArgs) => {
  const args = allArgs.filter(arg => typeof arg !== 'function')
  const callbacks = allArgs.filter(arg => typeof arg === 'function')
  const hasCallbacks = callbacks.length > 0

  const [testName, routesMap] = args
  let [,, options = {}, actions] = args

  if (Array.isArray(options)) {
    actions = options
    options = {}
  }

  if (!actions) {
    actions = Object.keys(routesMap).filter(type => !/FIRST|REDIRECTED/.test(type))
  }

  const initialPath = typeof actions[0] === 'string' && actions[0].charAt(0) === '/'
    ? actions.shift()
    : '/first'

  const hasMultipleTests = actions.length > 1
  let num = 1

  if (hasMultipleTests) {
    describe(testName, () => {
      for (const action of actions) {
        if (Array.isArray(action)) {
          const name = action[0]
          const act = action[1]
          createTest(name, routesMap, initialPath, act, options, num++)
        }
        else {
          const name = JSON.stringify(action)
          createTest(name, routesMap, initialPath, action, options, num++)
        }
      }

      if (hasCallbacks) {
        callbacks.forEach((cb, index) => {
          const name = callbacks.length === 1 ? 'snipes' : 'snipes ' + (++index)
          createSnipes(name, routesMap, initialPath, options, cb)
        })
      }
    })
  }
  else {
    const isSnipesOnly = initialPath === '/first' && actions.length === 0

    if (hasCallbacks && isSnipesOnly) {
      callbacks.forEach((cb, index) => {
        const name = callbacks.length === 1 ? testName : 'snipes ' + (++index)
        createSnipes(name, routesMap, initialPath, options, cb)
      })
    }
    else if (hasCallbacks) {
      describe(testName, () => {
        const name = actions[0] ? JSON.stringify(actions[0]) : 'firstRoute - ' + initialPath

        createTest(name, routesMap, initialPath, actions[0], options, num)

        callbacks.forEach((cb, index) => {
          const name = callbacks.length === 1 ? 'snipes' : 'snipes ' + (++index)
          createSnipes(name, routesMap, initialPath, options, cb)
        })
      })
    }
    else if (Array.isArray(actions[0])) {
      const name = actions[0][0]
      const act = actions[0][1]

      createTest(name, routesMap, initialPath, act, options, num)
    }
    else {
      createTest(testName, routesMap, initialPath, actions[0], options, num)
    }
  }
}

const createTest = (testName, routesMap, initialPath, item, opts, num) => {
  test(testName, async () => {
    const {
      store,
      history,
      routes,
      options,
      firstRoute,
      initialState
    } = setupStore(routesMap, initialPath, opts)

    const firstAction = firstRoute(true)
    const res = await store.dispatch(firstAction)

    if (routesMap.FIRST || initialPath !== '/first') {
      const prefix = 'firstRoute - ' + initialPath + ' - ' + num
      snapChange(prefix, res, store, history, initialState)
    }

    if (typeof item === 'string' && item.charAt(0) === '/') {
      const url = item
      const res = await history.push(url)

      snapChange(num, res, store, history)
    }
    else if (item) {
      const action = typeof item === 'string' ? { type: item } : item
      const res = await store.dispatch(action)

      snapChange(num, res, store, history)
    }

    snapRoutes(num, routes)
    snapOptions(num, options)

    if (opts.log) console.log(store.getState().location)
  })
}

const createSnipes = (testName, routesMap, initialPath, opts, callback) => {
  test(testName, async () => {
    const {
      store,
      history,
      routes,
      options,
      firstRoute
    } = setupStore(routesMap, initialPath, opts)

    const firstResponse = opts.dispatchFirstRoute === false
      ? null
      : await store.dispatch(firstRoute(true))

    await callback({
      firstRoute,
      firstResponse,
      history,
      routes,
      options,
      store,
      dispatch: store.dispatch,
      getState: store.getState,
      getLocation: () => store.getState().location,
      snapChange,
      snap: async (action, prefix = '') => {
        const res = await store.dispatch(action)

        prefix = prefix || JSON.stringify(action) || 'function'

        snapChange(prefix, res, store, history)
        snapRoutes(prefix, routes)
        snapOptions(prefix, options)
        return res
      }
    })

    if (opts.log) console.log(store.getState().location)
  })
}

const setupStore = (routesMap, initialPath, opts) => {
  const routes = createRoutes(routesMap)
  const options = createOptions(opts)

  options.initialEntries = [initialPath]
  options.extra = options.extra || { arg: 'extra-arg' }

  const middlewareFunc = options.middlewareFunc
  delete options.middlewareFunc

  const title = (state, action = {}) => {
    return action.payload
      ? action.type + ' - ' + JSON.stringify(action.payload)
      : action.type
  }

  const { middleware, reducer, firstRoute, history } = createRouter(
    routes,
    options,
    middlewareFunc
  )

  const rootReducer = combineReducers({ title, location: reducer })
  const enhancer = applyMiddleware(middleware)
  const store = createStore(rootReducer, enhancer)

  const initialState = store.getState()

  return {
    store,
    firstRoute,
    initialState,
    routes,
    options,
    history
  }
}

const callbacks = [
  'beforeLeave',
  'beforeEnter',
  'onLeave',
  'onLeave',
  'onEnter',
  'thunk',
  'onComplete',
  'onError'
]

const createRoutes = (routesMap) => {
  const routes = {}

  for (const type in routesMap) {
    routes[type] = typeof routesMap[type] === 'object'
      ? { ...routesMap[type] }
      : routesMap[type]

    const route = routes[type]

    for (const cb of callbacks) {
      if (typeof route[cb] === 'function') {
        route[cb] = jest.fn(route[cb])
      }
    }
  }

  return {
    FIRST: {
      path: '/first'
    },
    NEVER_USED_PATHLESS: { // insures pathless routes can co-exist with regular routes
      thunk: jest.fn()
    },
    REDIRECTED: {
      path: '/redirected',
      beforeEnter: () => {
        return new Promise(res => setTimeout(res, 1))
      },
      onComplete: jest.fn(() => 'redirect_complete')
    },
    ...routes
  }
}

const createOptions = (opts) => {
  const options = { ...opts }

  for (const cb of callbacks) {
    if (typeof opts[cb] === 'function') {
      options[cb] = jest.fn(opts[cb])
    }
  }

  return options
}

const snapRoutes = (prefix, routes) => {
  for (const type in routes) {
    const route = routes[type]
    snapCallbacks(prefix + ' - routes - ' + type, route)
  }
}

const snapOptions = (prefix, options) => {
  snapCallbacks(prefix + ' - options', options)
}

const snapCallbacks = (prefix, obj) => {
  expectBeforeLeave(prefix, obj)
  expectBeforeEnter(prefix, obj)
  expectOnLeave(prefix, obj)
  expectOnEnter(prefix, obj)
  expectThunk(prefix, obj)
  expectOnComplete(prefix, obj)
  expectOnError(prefix, obj)
}

const snapChange = (prefix, res, store, history, initialState) => {
  if (initialState) expectInitialState(prefix, initialState)

  expectState(prefix, store)
  expectResponse(prefix, res)
  expectEntries(prefix, history)
  expectIndex(prefix, history)
  expectTitle(prefix)
}

// all these expect functions are broken out separately so we can easily see the
// name of the expectation that failed in the trace displayed in the Wallaby web panel

const expectInitialState = (prefix, initialState) => {
  expect(initialState).toMatchSnapshot(prefix + ' - initial_state')
}

const expectState = (prefix, store) => {
  expect(store.getState()).toMatchSnapshot(prefix + ' - state')
}

const expectResponse = (prefix, res) => {
  expect(res).toMatchSnapshot(prefix + ' - response')
}

const expectEntries = (prefix, history) => {
  expect(history.entries).toMatchSnapshot(prefix + ' - history_entries')
}

const expectIndex = (prefix, history) => {
  expect(history.index).toMatchSnapshot(prefix + ' - history_index')
}

const expectTitle = (prefix) => {
  expect(document.title).toMatchSnapshot(prefix + ' - title')
}

const expectBeforeLeave = (prefix, obj) => {
  if (typeof obj.beforeLeave === 'function' && obj.beforeLeave.mock) {
    expect(obj.beforeLeave.mock.calls.length).toMatchSnapshot(prefix + ' - beforeLeave')
  }
}

const expectBeforeEnter = (prefix, obj) => {
  if (typeof obj.beforeEnter === 'function' && obj.beforeEnter.mock) {
    expect(obj.beforeEnter.mock.calls.length).toMatchSnapshot(prefix + ' - beforeEnter')
  }
}

const expectOnLeave = (prefix, obj) => {
  if (typeof obj.onLeave === 'function' && obj.onLeave.mock) {
    expect(obj.onLeave.mock.calls.length).toMatchSnapshot(prefix + ' - onLeave')
  }
}

const expectOnEnter = (prefix, obj) => {
  if (typeof obj.onEnter === 'function' && obj.onEnter.mock) {
    expect(obj.onEnter.mock.calls.length).toMatchSnapshot(prefix + ' - onEnter')
  }
}

const expectThunk = (prefix, obj) => {
  if (typeof obj.thunk === 'function' && obj.thunk.mock) {
    expect(obj.thunk.mock.calls.length).toMatchSnapshot(prefix + ' - thunk')
  }
}

const expectOnComplete = (prefix, obj) => {
  if (typeof obj.onComplete === 'function' && obj.onComplete.mock) {
    expect(obj.onComplete.mock.calls.length).toMatchSnapshot(prefix + ' - onComplete')
  }
}

const expectOnError = (prefix, obj) => {
  if (typeof obj.onError === 'function' && obj.onError.mock) {
    expect(obj.onError.mock.calls.length).toMatchSnapshot(prefix + ' - onError')
  }
}
