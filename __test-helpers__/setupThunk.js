import { createStore, applyMiddleware, combineReducers } from 'redux'
import createRouter from '../src/createRouter'

export default async (path = '/', thunkArg, opts, dispatchFirstRoute = true) => {
  const routesMap = {
    FIRST: '/first',
    SECOND: { path: '/second/:param', thunk: thunkArg },
    THIRD: { path: '/third/:param' }
  }

  const options = { extra: { arg: 'extra-arg' }, initialEntries: path, ...opts }

  const { middleware, reducer, history, firstRoute } = createRouter(
    routesMap,
    options
  )

  const rootReducer = combineReducers({
    location: reducer
  })

  const enhancer = applyMiddleware(middleware)
  const store = createStore(rootReducer, enhancer)

  if (dispatchFirstRoute) await store.dispatch(firstRoute())

  return { store, firstRoute, history }
}
