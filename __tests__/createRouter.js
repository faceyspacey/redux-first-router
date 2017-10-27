import { applyMiddleware, createStore, compose } from 'redux'
import reduxThunk from 'redux-thunk'
import createRouter from '../src/createRouter'

import call from '../src/middleware/call'
import enter from '../src/middleware/enter'
import createRouteAction from '../src/middleware/createRouteAction'

const setup = (path = '/first', options = {}) => {
  const routesMap = {
    FIRST: '/first',
    SECOND: '/second',
    THIRD: '/third'
  }

  options.initialEntries = [path]
  options.extra = { arg: 'extra-arg' }

  const reducer = (state = {}, action = {}) => ({
    title: action.type
  })

  const routerMiddlewares = [
    createRouteAction,
    enter
  ]

  const { enhancer, firstRoute, history } = createRouter(
    routesMap,
    options,
    routerMiddlewares
  )
  const middlewares = applyMiddleware(reduxThunk)
  const enhancers = compose(enhancer, middlewares)
  const store = createStore(reducer, enhancers)

  return {
    store,
    firstRoute,
    history
  }
}

test('store.dispatch', async () => {
  const { store, firstRoute, history } = setup()
  const action = firstRoute()

  let res = await store.dispatch(action)
  expect(store.getState().location.type).toEqual('FIRST')

  res = await store.dispatch({ type: 'SECOND' })
  expect(store.getState().location.type).toEqual('SECOND')
})


test('history.push', async () => {
  const { store, firstRoute, history } = setup()
  const action = firstRoute()

  let res = await store.dispatch(action)
  expect(store.getState().location.type).toEqual('FIRST')

  res = await history.push('/second')
  expect(store.getState().location.type).toEqual('SECOND')
})


// const routerMiddlewares = [
//   async (bag, next) => {
//     console.log('MIDDLEWARE 1!', bag)
//     const res = bag.dispatch({ type: 'BLA' })
//     await next()
//     return res
//   }
// ]
