import { createStore, applyMiddleware, compose } from 'redux'
import createHistory from 'history/createMemoryHistory'
import connectTypes from '../src/connectTypes'


export default (path = '/', thunk) => {
  const routesMap = {
    FIRST: '/first',
    SECOND: { path: '/second/:param', thunk },
    THIRD: { path: '/third/:param' },
  }

  const history = createHistory({
    initialEntries: [path],
    initialIndex: 0,
    keyLength: 6,
  })

  const { middleware, enhancer, thunk: ssrThunk, reducer: locationReducer } = connectTypes(history, routesMap)

  const middlewares = applyMiddleware(middleware)

  const reducer = (state = {}, action = {}) => ({
    location: locationReducer(state.location, action),
  })

  const store = createStore(reducer, undefined, compose(enhancer, middlewares))

  return { store, thunk: ssrThunk }
}
