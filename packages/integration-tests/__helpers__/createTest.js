import { applyMiddleware, createStore, combineReducers } from 'redux'
import {
  get,
  clear,
} from '@respond-framework/rudy/src/history/utils/sessionStorage'
import { locationToUrl } from '@respond-framework/rudy/src/utils'
import { createRouter } from '@respond-framework/rudy/src'
import awaitUrlChange from './awaitUrlChange'

export default async (...allArgs) => {
  const args = allArgs.filter((arg) => typeof arg !== 'function')
  const callbacks = allArgs.filter((arg) => typeof arg === 'function')
  const hasCallbacks = callbacks.length > 0

  const [testName, routesMap] = args
  let [, , options = {}, actions] = args

  if (Array.isArray(options)) {
    actions = options
    options = {}
  }

  options = Object.assign({}, JSON.parse(process.env.RUDY_OPTIONS), options) // do things like force all tests to log -- see ../.testsConfig.json

  options.wallabyErrors =
    options.wallabyErrors !== undefined
      ? options.wallabyErrors
      : process.env.WALLABY === 'true'

  if (options.skip) return

  options.testBrowser = options.testBrowser || false

  if (!actions) {
    actions = Object.keys(routesMap).filter(
      (type) => !/FIRST|REDIRECTED/.test(type),
    )
  }

  const initialPath =
    typeof actions[0] === 'string' && actions[0].charAt(0) === '/'
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
        } else {
          const name = JSON.stringify(action)
          createTest(name, routesMap, initialPath, action, options, num++)
        }
      }

      if (hasCallbacks) {
        callbacks.forEach((cb, index) => {
          const name = callbacks.length === 1 ? 'snipes' : `snipes ${++index}`
          createSnipes(name, routesMap, initialPath, options, cb)
        })
      }
    })
  } else {
    const isSnipesOnly = initialPath === '/first' && actions.length === 0

    if (hasCallbacks && isSnipesOnly) {
      callbacks.forEach((cb, index) => {
        const name = callbacks.length === 1 ? testName : `snipes ${++index}`
        createSnipes(name, routesMap, initialPath, options, cb)
      })
    } else if (hasCallbacks) {
      describe(testName, () => {
        const name = actions[0]
          ? JSON.stringify(actions[0])
          : `firstRoute - ${initialPath}`

        createTest(name, routesMap, initialPath, actions[0], options, num)

        callbacks.forEach((cb, index) => {
          const name = callbacks.length === 1 ? 'snipes' : `snipes ${++index}`
          createSnipes(name, routesMap, initialPath, options, cb)
        })
      })
    } else if (Array.isArray(actions[0])) {
      const name = actions[0][0]
      const act = actions[0][1]

      createTest(name, routesMap, initialPath, act, options, num)
    } else {
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
      initialState,
    } = setupStore(routesMap, initialPath, opts)

    const firstAction = firstRoute(false)
    const res = await store.dispatch(firstAction)

    if (routesMap.FIRST || initialPath !== '/first') {
      const prefix = `firstRoute - ${initialPath} - ${num}`
      snapChange(prefix, res, store, history, opts, initialState)
    }

    if (typeof item === 'string' && item.charAt(0) === '/') {
      const url = item
      const res = await history.push(url)

      snapChange(num, res, store, history, opts)
    } else if (item) {
      const action = typeof item === 'string' ? { type: item } : item
      const res = await store.dispatch(action)

      snapChange(num, res, store, history, opts)
    }

    snapRoutes(num, routes)
    snapOptions(num, options)

    if (opts.log) {
      if (typeof opts.log !== 'function') {
        console.log(store.getState().location)
      } else {
        opts.log(store.getState().location)
      }
    }

    history.unlisten()
  })
}

const createSnipes = (testName, routesMap, initialPath, opts, callback) => {
  test(testName, async () => {
    const { store, history, routes, options, firstRoute } = setupStore(
      routesMap,
      initialPath,
      opts,
    )

    const firstResponse =
      opts.dispatchFirstRoute === false
        ? null
        : await store.dispatch(firstRoute(false))

    const pop = opts.testBrowser && createPop(history)
    let defaultPrefix = 0

    await callback({
      firstRoute,
      firstResponse,
      history,
      routes,
      options,
      store,
      pop,
      dispatch: store.dispatch,
      getState: store.getState,
      getLocation: () => store.getState().location,
      snapChange: (prefix, res) => {
        if (opts.snipesOnly) return res

        if (typeof prefix === 'string') {
          return snapChange(prefix, res, store, history, opts)
        }

        res = prefix
        return snapChange(++defaultPrefix, res, store, history, opts)
      },
      snap: async (action, prefix = '') => {
        prefix = prefix || JSON.stringify(action) || 'function'

        const res = await store.dispatch(action)

        if (opts.snipesOnly) return res

        snapChange(prefix, res, store, history, opts)
        snapRoutes(prefix, routes)
        snapOptions(prefix, options)

        return res
      },
      snapPop: async (direction, prefix = '') => {
        const res = await pop(direction)

        if (opts.snipesOnly) return res

        snapChange(prefix, res, store, history, opts)
        snapRoutes(prefix, routes)
        snapOptions(prefix, options)

        return res
      },
    })

    if (opts.log) {
      if (typeof opts.log !== 'function') {
        console.log(store.getState().location)
      } else {
        opts.log(store.getState().location)
      }
    }

    history.unlisten()
  })
}

export const setupStore = (routesMap, initialPath, opts) => {
  const routes = createRoutes(routesMap)
  const options = createOptions(opts)

  options.initialEntries = [initialPath]
  options.extra = options.extra || { arg: 'extra-arg' }

  const middlewareFunc = options.middlewareFunc
  delete options.middlewareFunc

  const title = (state, action = {}) =>
    action.payload !== undefined
      ? `${action.type} - ${JSON.stringify(action.payload)}`
      : action.type

  const { middleware, reducer, firstRoute, history } = createRouter(
    routes,
    options,
    middlewareFunc,
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
    history,
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
  'onError',
]

const createRoutes = (routesMap) => {
  const routes = {}

  for (const type in routesMap) {
    routes[type] =
      typeof routesMap[type] === 'object'
        ? { ...routesMap[type] }
        : routesMap[type]

    const route = routes[type]

    for (const cb in route) {
      if (typeof route[cb] === 'function') {
        route[cb] = jest.fn(route[cb])
      }
    }
  }

  // we add them like this (rather than merging over them) to preserve natural order
  // the tests would like the routes defined in. Order matters for matching types to URLs.
  // This essentially replicates what would typically happen in userland where they aren't
  // override routes for the convenience of tests.
  if (!routes.FIRST) {
    routes.FIRST = {
      path: '/first',
    }
  }

  if (!routes.NEVER_USED_PATHLESS) {
    routes.NEVER_USED_PATHLESS = {
      thunk: jest.fn(),
    }
  }

  if (!routes.REDIRECTED) {
    routes.REDIRECTED = {
      path: '/redirected',
      beforeEnter: () => new Promise((res) => setTimeout(res, 1)),
      onComplete: jest.fn(() => 'redirect_complete'),
    }
  }

  return routes
}

const createOptions = (opts = {}) => {
  const options = { ...opts }

  for (const cb in options) {
    if (typeof opts[cb] === 'function') {
      options[cb] = jest.fn(opts[cb])
    }
  }

  return options
}

const snapRoutes = (prefix, routes) => {
  for (const type in routes) {
    const route = routes[type]
    snapCallbacks(`${prefix} - routes - ${type}`, route)
  }
}

const snapOptions = (prefix, options) => {
  snapCallbacks(`${prefix} - options`, options)
}

const snapCallbacks = (prefix, obj) => {
  expectBeforeLeave(prefix, obj)
  expectBeforeEnter(prefix, obj)
  expectOnLeave(prefix, obj)
  expectOnEnter(prefix, obj)
  expectThunk(prefix, obj)
  expectOnComplete(prefix, obj)
  expectOnError(prefix, obj)

  snapOtherFunctions(prefix, obj)
}

// snapshot the number of calls of all additional functions that aren't middleware callbacks
const snapOtherFunctions = (prefix, obj) => {
  for (const k in obj) {
    if (!callbacks.includes(k) && typeof obj[k] === 'function' && obj[k].mock) {
      expect(obj[k].mock.calls.length).toMatchSnapshot(`${prefix} - ${k}`)
    }
  }
}

const snapChange = (prefix, res, store, history, opts = {}, initialState) => {
  if (initialState) expectInitialState(prefix, initialState)

  expectState(prefix, store)
  expectResponse(prefix, res)
  expectTitle(prefix)

  if (opts.testBrowser) {
    expectSessionStorage(prefix)
    expectWindowLocation(prefix)
  }
}

// all these expect functions are broken out separately so we can easily see the
// name of the expectation that failed in the trace displayed in the Wallaby web panel

const expectInitialState = (prefix, initialState) => {
  expect(initialState).toMatchSnapshot(`${prefix} - initial_state`)
}

const expectState = (prefix, store) => {
  expect(store.getState()).toMatchSnapshot(`${prefix} - state`)
}

const expectResponse = (prefix, res) => {
  expect(res).toMatchSnapshot(`${prefix} - response`)
}

const expectTitle = (prefix) => {
  expect(document.title).toMatchSnapshot(`${prefix} - title`)
}

const expectSessionStorage = (prefix) => {
  expect(get()).toMatchSnapshot(`${prefix} - sessionStorage`)
}

const expectWindowLocation = (prefix) => {
  expect(locationToUrl(window.location)).toMatchSnapshot(
    `${prefix} - windowLocation`,
  )
}

const expectBeforeLeave = (prefix, obj) => {
  if (typeof obj.beforeLeave === 'function' && obj.beforeLeave.mock) {
    expect(obj.beforeLeave.mock.calls.length).toMatchSnapshot(
      `${prefix} - beforeLeave`,
    )
  }
}

const expectBeforeEnter = (prefix, obj) => {
  if (typeof obj.beforeEnter === 'function' && obj.beforeEnter.mock) {
    expect(obj.beforeEnter.mock.calls.length).toMatchSnapshot(
      `${prefix} - beforeEnter`,
    )
  }
}

const expectOnLeave = (prefix, obj) => {
  if (typeof obj.onLeave === 'function' && obj.onLeave.mock) {
    expect(obj.onLeave.mock.calls.length).toMatchSnapshot(`${prefix} - onLeave`)
  }
}

const expectOnEnter = (prefix, obj) => {
  if (typeof obj.onEnter === 'function' && obj.onEnter.mock) {
    expect(obj.onEnter.mock.calls.length).toMatchSnapshot(`${prefix} - onEnter`)
  }
}

const expectThunk = (prefix, obj) => {
  if (typeof obj.thunk === 'function' && obj.thunk.mock) {
    expect(obj.thunk.mock.calls.length).toMatchSnapshot(`${prefix} - thunk`)
  }
}

const expectOnComplete = (prefix, obj) => {
  if (typeof obj.onComplete === 'function' && obj.onComplete.mock) {
    expect(obj.onComplete.mock.calls.length).toMatchSnapshot(
      `${prefix} - onComplete`,
    )
  }
}

const expectOnError = (prefix, obj) => {
  if (typeof obj.onError === 'function' && obj.onError.mock) {
    expect(obj.onError.mock.calls.length).toMatchSnapshot(`${prefix} - onError`)
  }
}

// for testing pops in a "real" browser (as simulated by Jest)

const createPop = (history) => async (direction = 'back') => {
  history.currentPop = null
  window.history[direction]()
  return awaitPop(history)
}

const awaitPop = async (history, tries = 1) => {
  if (tries >= 10) {
    throw new Error(`awaitPop reached the maximum amount of tries (${tries})`)
  }

  await new Promise((res) => setTimeout(res, 3))
  return history.currentPop || awaitPop(history, ++tries)
}

// needed to put multiple browser tests in the same file

export const resetBrowser = async () => {
  /* eslint-env browser */
  const storage = get()
  const index = storage && storage.index

  if (index) {
    const delta = index * -1
    const oldUrl = locationToUrl(window.location)

    window.history.go(delta)

    if (oldUrl !== '/') {
      // will otherwise fail because the last route was also `/` (all browser tests start on `/`)
      await awaitUrlChange() // we need for `go` to complete
    }
  }

  window.history.replaceState({}, null, '/') // insure if the index was 0 but there was a replace on it, that we are back at '/'
  clear()
  /* eslint-env */
}
