import { applyMiddleware, createStore } from 'redux'
import reduxThunk from 'redux-thunk'
import { createRouter } from '@respond-framework/rudy/src'

const setup = (
  path = '/',
  options = { title: 'title', location: 'location' },
  routesMap,
) => {
  routesMap = routesMap || {
    FIRST: {
      path: '/first',
      // hash: () => false
      query: {
        dog: /(ff)?/,
      },
    },
    SECOND: '/second/:param',
    THIRD: '/third',
  }

  options.initialEntries = path
  options.extra = { arg: 'extra-arg' }

  const tools = createRouter(routesMap, options)
  tools.history = tools.rudy.history

  return { ...tools, routesMap }
}

export default setup

export const setupAll = async (
  path,
  options,
  {
    rootReducer,
    preLoadedState,
    routesMap,
    dispatchFirstRoute = true,
    additionalMiddleware = (store) => (next) => (action) => next(action),
  } = {},
) => {
  const tools = setup(path, options, routesMap)
  const { middleware, reducer, firstRoute } = tools
  const enhancer = applyMiddleware(middleware, reduxThunk, additionalMiddleware)

  rootReducer =
    rootReducer ||
    ((state = {}, action = {}) => ({
      location: reducer(state.location, action),
      title: action.type,
    }))

  const store = createStore(rootReducer, preLoadedState, enhancer)
  if (dispatchFirstRoute) await store.dispatch(firstRoute())

  return {
    ...tools,
    store,
  }
}
