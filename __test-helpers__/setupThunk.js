import { createStore, applyMiddleware, compose, combineReducers } from 'redux'
import createRouter from '../src/createRouter'

export default async (path = '/', thunkArg, opts, dispatchFirstRoute = true) => {
  const routesMap = {
    FIRST: '/first',
    SECOND: { path: '/second/:param', thunk: thunkArg },
    THIRD: { path: '/third/:param' }
  }

  const options = { extra: { arg: 'extra-arg' }, initialEntries: path, ...opts }

  const { enhancer, reducer, history, firstRoute } = createRouter(
    routesMap,
    options
  )

  const rootReducer = combineReducers({
    location: reducer
  })

  const store = createStore(rootReducer, enhancer)

  if (dispatchFirstRoute) await store.dispatch(firstRoute())

  return { store, firstRoute, history }
}
