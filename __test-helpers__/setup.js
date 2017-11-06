import { applyMiddleware, createStore, compose } from 'redux'
import reduxThunk from 'redux-thunk'
import createRouter from '../src/createRouter'

const setup = (
  path = '/',
  options = { title: 'title', location: 'location' },
  routesMap
) => {
  routesMap = routesMap || {
    FIRST: '/first',
    SECOND: '/second/:param',
    THIRD: '/third'
  }

  options.initialEntries = path
  options.extra = { arg: 'extra-arg' }

  const tools = createRouter(routesMap, options)

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
    additionalMiddleware = store => next => action => next(action)
  } = {}
) => {
  const tools = setup(path, options, routesMap)
  const { enhancer, reducer, firstRoute } = tools
  const middlewares = applyMiddleware(reduxThunk, additionalMiddleware)
  const enhancers = compose(enhancer, middlewares)

  rootReducer =
    rootReducer ||
    ((state = {}, action = {}) => ({
      location: reducer(state.location, action),
      title: action.type
    }))

  const store = createStore(rootReducer, preLoadedState, enhancers)
  if (dispatchFirstRoute) await store.dispatch(firstRoute())

  return {
    ...tools,
    store
  }
}
