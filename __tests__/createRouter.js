import { applyMiddleware, createStore, compose, combineReducers } from 'redux'
import reduxThunk from 'redux-thunk'
import createRouter from '../src/createRouter'

import { NOT_FOUND } from '../src'

import fakeAsyncWork from '../__test-helpers__/fakeAsyncWork'

const setup = (path = '/first', options = {}, custom = {}) => {
  const routesMap = {
    FIRST: '/first',
    SECOND: '/second',
    THIRD: {
      path: '/third',
      thunk: async () => {
        await fakeAsyncWork()
        return 'thunk'
      }
    },
    FOURTH: {
      path: '/fourth',
      thunk: async () => {
        await fakeAsyncWork()
        return 'thunk'
      },
      onComplete: () => {
        return 'onComplete'
      }
    },
    ...custom.routesMap
  }

  options.initialEntries = [path]
  options.extra = { arg: 'extra-arg' }

  const { enhancer, reducer, firstRoute, history } = createRouter(
    routesMap,
    options
  )

  const middlewares = applyMiddleware(reduxThunk)
  const enhancers = compose(enhancer, middlewares)
  const title = (state = {}, action = {}) => action.type
  const rootReducer = combineReducers({ title, location: reducer })
  const store = createStore(rootReducer, enhancers)

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
  expect(res.type).toEqual('FIRST')
  expect(history.location.pathname).toEqual('/first')

  res = await store.dispatch({ type: 'SECOND' })
  expect(store.getState().location.type).toEqual('SECOND')
  expect(res.type).toEqual('SECOND')
  expect(history.location.pathname).toEqual('/second')

  expect(history.length).toEqual(2)

  log(store)
})


test('history.push', async () => {
  const { store, firstRoute, history } = setup()
  const action = firstRoute()

  let res = await store.dispatch(action)
  expect(store.getState().location.type).toEqual('FIRST')
  expect(res.type).toEqual('FIRST')
  expect(history.location.pathname).toEqual('/first')

  res = await history.push('/second')
  expect(store.getState().location.type).toEqual('SECOND')
  expect(window.document.title).toEqual('SECOND')
  expect(res.type).toEqual('SECOND')
  expect(history.location.pathname).toEqual('/second')

  log(store)
})

test('thunk', async () => {
  const { store, firstRoute, history } = setup()
  const action = firstRoute()

  let res = await store.dispatch(action)
  expect(store.getState().location.type).toEqual('FIRST')
  expect(res.type).toEqual('FIRST')
  expect(history.location.pathname).toEqual('/first')

  res = await store.dispatch({ type: 'THIRD' })
  expect(store.getState().location.type).toEqual('THIRD')
  expect(window.document.title).toEqual('THIRD')
  expect(res).toEqual('thunk')
  expect(history.location.pathname).toEqual('/third')

  log(store)
})

test('onComplete', async () => {
  const { store, firstRoute, history } = setup()
  const action = firstRoute()

  let res = await store.dispatch(action)
  expect(store.getState().location.type).toEqual('FIRST')
  expect(res.type).toEqual('FIRST')
  expect(history.location.pathname).toEqual('/first')

  res = await store.dispatch({ type: 'FOURTH' })
  expect(store.getState().location.type).toEqual('FOURTH')
  expect(res).toEqual('onComplete')
  expect(history.location.pathname).toEqual('/fourth')

  log(store)
})

test('onEnter', async () => {
  const onEnter = jest.fn()
  const options = { onEnter }
  const { store, firstRoute, history } = setup('/first', options)
  const action = firstRoute()

  let res = await store.dispatch(action)
  expect(store.getState().location.type).toEqual('FIRST')
  expect(res.type).toEqual('FIRST')
  expect(history.location.pathname).toEqual('/first')

  res = await store.dispatch({ type: 'FOURTH' })
  expect(store.getState().location.type).toEqual('FOURTH')
  expect(res).toEqual('onComplete')
  expect(history.location.pathname).toEqual('/fourth')

  log(store)

  expect(onEnter).toBeCalled()
})

test('beforeLeave return false', async () => {
  const beforeLeave = jest.fn(req => false)

  const routesMap = {
    FIRST: {
      path: '/first',
      beforeLeave
    }
  }

  const { store, firstRoute, history } = setup('/first', {}, { routesMap })
  const action = firstRoute()

  let res = await store.dispatch(action)
  expect(store.getState().location.type).toEqual('FIRST')

  log(store)

  res = await store.dispatch({ type: 'SECOND' })
  expect(store.getState().location.type).toEqual('FIRST')
  expect(res).toEqual(false)
  expect(history.location.pathname).toEqual('/first')

  log(store)

  expect(beforeLeave).toBeCalled()
})

test('beforeEnter redirect', async () => {
  const beforeEnter = jest.fn(req => {
    if (req.action.type === 'SECOND') {
      const action = { type: 'THIRD' }
      req.dispatch(action)
    }
  })
  const options = { beforeEnter }
  const { store, firstRoute, history } = setup('/first', options)
  const action = firstRoute()

  let res = await store.dispatch(action)
  expect(store.getState().location.type).toEqual('FIRST')
  expect(history.location.pathname).toEqual('/first')

  res = await store.dispatch({ type: 'SECOND' })
  expect(store.getState().location.type).toEqual('THIRD')
  expect(history.location.pathname).toEqual('/third')
  expect(res).toEqual('thunk')

  log(store)

  expect(beforeEnter).toBeCalled()
})

test('beforeEnter redirect (from history)', async () => {
  const beforeEnter = jest.fn(req => {
    if (req.action.type === 'SECOND') {
      const action = { type: 'THIRD' }
      req.dispatch(action)
    }
  })
  const options = { beforeEnter }
  const { store, firstRoute, history } = setup('/first', options)
  const action = firstRoute()

  let res = await store.dispatch(action)
  expect(store.getState().location.type).toEqual('FIRST')
  expect(history.location.pathname).toEqual('/first')

  res = await history.push('/second')
  expect(store.getState().location.type).toEqual('THIRD')
  expect(history.location.pathname).toEqual('/third')

  log(store)

  expect(beforeEnter).toBeCalled()
})

it('firstRoute (delayed commit)', async () => {
  const { store, firstRoute, history } = setup()
  const action = firstRoute()

  const res = await store.dispatch(action)
  expect(store.getState().location.type).toEqual('FIRST')
  expect(history.location.pathname).toEqual('/first')
  expect(res.type).toEqual('FIRST')

  log(store)
})

test('firstRoute (delayed commit - redirect)', async () => {
  const onEnter = jest.fn(req => {
    req.dispatch({ type: 'THIRD' })
  })

  const beforeEnter = jest.fn(req => {
    req.dispatch({ type: 'FOURTH' })
  })

  const routesMap = {
    SECOND: {
      path: '/second',
      onEnter
    },
    THIRD: {
      path: '/third',
      beforeEnter
    }
  }

  const { store, firstRoute, history } = setup('/first', {}, { routesMap })
  const action = firstRoute()

  let res = await store.dispatch(action)
  expect(store.getState().location.type).toEqual('FIRST')
  expect(history.location.pathname).toEqual('/first')

  res = await store.dispatch({ type: 'SECOND' })
  expect(store.getState().location.type).toEqual('FOURTH')
  expect(history.location.pathname).toEqual('/fourth')

  // the key thing we're testing for:
  expect(history.entries.length).toEqual(2)
  expect(history.length).toEqual(2)

  log(store)

  expect(beforeEnter).toBeCalled()
  expect(onEnter).toBeCalled()
})


it('beforeEnter redirect (firstRoute)', async () => {
  const beforeEnter = jest.fn(req => {
    if (req.action.type === 'FIRST') {
      const action = { type: 'SECOND' }
      return req.dispatch(action)
    }
  })

  const options = { beforeEnter }
  const { store, firstRoute, history } = setup('/first', options)
  const action = firstRoute()

  let res = await store.dispatch(action)
  expect(store.getState().location.type).toEqual('SECOND')
  expect(history.location.pathname).toEqual('/second')

  // log(store)

  expect(beforeEnter).toBeCalled()
})


test('onError', async () => {
  const onError = jest.fn(req => {
    console.log(req.error.message)
    return 'onError'
  })

  const routesMap = {
    SECOND: {
      path: '/second',
      beforeEnter: () => {
        throw new Error('fail!!')
      },
      onError
    }
  }

  const { store, firstRoute, history } = setup('/first', {}, { routesMap })
  const action = firstRoute()

  let res = await store.dispatch(action)
  expect(store.getState().location.type).toEqual('FIRST')

  log(store)

  res = await store.dispatch({ type: 'SECOND' })
  expect(store.getState().location.type).toEqual('FIRST')
  expect(res).toEqual('onError')
  expect(history.location.pathname).toEqual('/first')

  log(store)

  expect(onError).toBeCalled()
})


test('notFound', async () => {
  const routesMap = {
    SECOND: {
      path: '/second',
      thunk: async ({ dispatch }) => {
        const action = { type: NOT_FOUND }
        await dispatch(action)
      }
    },
    [NOT_FOUND]: {
      path: '/not-found'
    }
  }

  const { store, firstRoute, history } = setup('/first', {}, { routesMap })
  const action = firstRoute()

  let res = await store.dispatch(action)
  expect(store.getState().location.type).toEqual('FIRST')

  res = await store.dispatch({ type: 'SECOND' })
  expect(store.getState().location.type).toEqual(NOT_FOUND)
  expect(res.type).toEqual(NOT_FOUND)
  expect(history.location.pathname).toEqual('/not-found')

  log(store)
})


test('notFound on firstLoad', async () => {
  const { store, firstRoute, history } = setup('/non-existent')
  const action = firstRoute()

  const res = await store.dispatch(action)

  expect(store.getState().location.type).toEqual(NOT_FOUND)
  expect(res.type).toEqual(NOT_FOUND)
  expect(history.location.pathname).toEqual('/non-existent')

  log(store)
})

const log = store => {
  const state = store.getState().location
  delete state.routesMap
  delete state.hasSSR
  console.log(state)
}
// const routerMiddlewares = [
//   async (bag, next) => {
//     console.log('MIDDLEWARE 1!', bag)
//     const res = bag.dispatch({ type: 'BLA' })
//     await next()
//     return res
//   }
// ]
