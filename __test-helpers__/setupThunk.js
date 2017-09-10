import { createStore, applyMiddleware, compose, combineReducers } from 'redux'
import createHistory from 'history/createMemoryHistory'
import connectRoutes from '../src/connectRoutes'

export default (path = '/', thunkArg) => {
  const routesMap = {
    FIRST: '/first',
    SECOND: { path: '/second/:param', thunk: thunkArg },
    THIRD: { path: '/third/:param' }
  }

  const hist = createHistory({
    initialEntries: [path]
  })

  const {
    middleware,
    enhancer,
    thunk,
    reducer,
    history
  } = connectRoutes(hist, routesMap, { extra: 'extra-arg' })

  const rootReducer = combineReducers({
    location: reducer
  })

  const middlewares = applyMiddleware(middleware)

  const store = createStore(rootReducer, compose(enhancer, middlewares))

  return { store, thunk, history }
}
