import { applyMiddleware, createStore, compose } from 'redux'
import reduxThunk from 'redux-thunk'
import createRouter from '../src/createRouter'

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
    async (bag, next) => {
      console.log('MIDDLEWARE 1!', bag)
      const res = bag.dispatch({ type: 'BLA' })
      await next()
      return res
    }
  ]

  const { enhancer, firstRoute } = createRouter(
    routesMap,
    options,
    routerMiddlewares
  )
  const middlewares = applyMiddleware(reduxThunk)
  const enhancers = compose(enhancer, middlewares)

  return createStore(reducer, enhancers)
}

test('first', async () => {
  const store = setup()

  const res = await store.dispatch({ type: 'SECOND' })
  const state = store.getState()
  console.log('RES', res, state)
})
