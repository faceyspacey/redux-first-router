import setup, { log } from '../__test-helpers__/rudySetup'
import { NOT_FOUND } from '../src/types'

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
  expect(res.payload).toEqual('thunk')
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
  expect(res.payload).toEqual('onComplete')
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
  expect(res.payload).toEqual('onComplete')
  expect(history.location.pathname).toEqual('/fourth')

  log(store)

  expect(onEnter).toHaveBeenCalledTimes(2)
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
  expect(res.payload).toEqual('thunk')

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

test('firstRoute (delayed commit - redirect) [/w inherited routes + callback array]', async () => {
  const onEnter = jest.fn(req => {
    req.dispatch({ type: 'WRONG' })
  })
  const onEnter2 = jest.fn(req => {
    req.dispatch({ type: 'THIRD' })
  })
  const onEnter3 = jest.fn()

  const beforeEnter = jest.fn(req => {
    req.dispatch({ type: 'FOURTH' })
  })

  const routesMap = {
    SECOND: {
      path: '/second',
      onEnter: 'BAZ'
    },
    THIRD: {
      path: '/third',
      inherit: 'FOO'
    },
    FOO: {
      beforeEnter: 'BAR'
    },
    BAR: {
      beforeEnter
    },
    BAZ: {
      onEnter: [onEnter, onEnter2, onEnter3]
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

  // the key thing we're testing for (that only 2 entries are recorded even though multiple redirects happened):
  console.log(history.entries)
  expect(history.entries.length).toEqual(2)
  expect(history.length).toEqual(2)

  log(store)

  expect(onEnter).toBeCalled()
  expect(onEnter2).toBeCalled()
  expect(onEnter3).not.toBeCalled()
  expect(beforeEnter).toBeCalled()

  expect(res.payload).toEqual('onComplete')
  expect(res.type).toEqual('FOURTH_COMPLETE')
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
    return req.error.message
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

  res = await store.dispatch({ type: 'SECOND' })
  log(store)

  expect(store.getState().location.type).toEqual('FIRST')
  expect(res.payload).toEqual('fail!!')
  expect(res.type).toEqual('SECOND_COMPLETE')
  expect(history.location.pathname).toEqual('/first')

  log(store)

  expect(onError).toBeCalled()
})

test('onError - with no onError callbacks provided (uses default)', async () => {
  const routesMap = {
    SECOND: {
      path: '/second',
      beforeEnter: () => {
        throw new Error('fail!!')
      }
    }
  }

  const { store, firstRoute, history } = setup('/first', {}, { routesMap })
  const action = firstRoute()

  let res = await store.dispatch(action)
  expect(store.getState().location.type).toEqual('FIRST')

  res = await store.dispatch({ type: 'SECOND' })
  log(store)

  expect(store.getState().location.type).toEqual('FIRST')
  expect(res.error.message).toEqual('fail!!')
  expect(res.type).toEqual('SECOND_ERROR')
  expect(history.location.pathname).toEqual('/first')

  log(store)
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
