import { createStore, applyMiddleware, compose, combineReducers } from 'redux'
import connectRoutes from '../src/connectRoutes'

export default (path = '/', thunkArg, opts, dispatchFirstRoute = true) => {
  const routesMap = {
    FIRST: '/first',
    SECOND: { path: '/second/:param', thunk: thunkArg },
    THIRD: { path: '/third/:param' }
  }

  const options = { extra: { arg: 'extra-arg' }, initialEntries: path, ...opts }

  const { middleware, enhancer, reducer, history, firstRoute } = connectRoutes(
    routesMap,
    options
  )

  const rootReducer = combineReducers({
    location: reducer
  })

  const middlewares = applyMiddleware(middleware)
  const enhancers = compose(enhancer, middlewares)
  const store = createStore(rootReducer, enhancers)

  if (dispatchFirstRoute) store.dispatch(firstRoute())

  return { store, firstRoute, history }
}
