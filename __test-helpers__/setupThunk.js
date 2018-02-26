import { createStore, applyMiddleware, compose, combineReducers } from 'redux'
import connectRoutes from '../src/connectRoutes'

export default (path = '/', thunkArg, opts) => {
  const routesMap = {
    FIRST: '/first',
    SECOND: { path: '/second/:param', thunk: thunkArg },
    THIRD: { path: '/third/:param' }
  }

  const options = { extra: 'extra-arg', initialEntries: path, ...opts }

  const { middleware, enhancer, thunk, reducer, history } = connectRoutes(
    routesMap,
    options
  )

  const rootReducer = combineReducers({
    location: reducer
  })

  const middlewares = applyMiddleware(middleware)

  const store = createStore(rootReducer, compose(enhancer, middlewares))

  return { store, thunk, history }
}
