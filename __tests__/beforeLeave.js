import fakeAsyncWork from '../__test-helpers__/fakeAsyncWork'

let setupAll

beforeEach(() => {
  jest.resetModules()
  setupAll = require('../__test-helpers__/setup').setupAll
})

it('return undefined (user can leave)', async () => {
  const beforeLeave = jest.fn()
  const routesMap = {
    FIRST: {
      path: '/first',
      beforeLeave
    },
    SECOND: '/second'
  }

  const { store, history } = await setupAll('/first', undefined, { routesMap })

  await store.dispatch({ type: 'SECOND' })

  const { type } = store.getState().location
  expect(type).toEqual('SECOND')
  expect(history.location.pathname).toEqual('/second')
  expect(beforeLeave).toHaveBeenCalledTimes(1)
})

it('return undefined (user can leave) -- global', async () => {
  const beforeLeave = jest.fn()

  const { store, history } = await setupAll('/first', { beforeLeave })
  await store.dispatch({ type: 'SECOND', payload: { param: 'foo' } })

  const { type } = store.getState().location
  expect(type).toEqual('SECOND')
  expect(history.location.pathname).toEqual('/second/foo')
  expect(beforeLeave).toHaveBeenCalledTimes(1)
})

it('return false (use cannot leave until manual re-dispatch in timeout)', async () => {
  let futureDispatch
  let canLeave = false
  const routesMap = {
    FIRST: {
      path: '/first',
      beforeLeave: ({ dispatch, getState, action }) => {
        futureDispatch = () => dispatch(action)
        return canLeave
      }
    },
    SECOND: '/second'
  }

  const { store, history } = await setupAll('/first', undefined, { routesMap })
  const res = await store.dispatch({ type: 'SECOND' })
  expect(res).toEqual(false)

  expect(store.getState().location.type).toEqual('FIRST')
  expect(history.location.pathname).toEqual('/first')

  // the idea is in a real app, a condition would be met (represented in state)
  // that allows allowing by the time of the 2nd dispatch attempt.
  canLeave = true
  const res2 = await futureDispatch()

  expect(store.getState().location.type).toEqual('SECOND')
  expect(history.location.pathname).toEqual('/second')
})

it('return false (user cannot leave) -- global', async () => {
  const beforeLeave = jest.fn(() => false)

  const { store, history } = await setupAll('/first', { beforeLeave })
  await store.dispatch({ type: 'SECOND', payload: { param: 'foo' } })

  const { type } = store.getState().location
  expect(type).toEqual('FIRST')
  expect(history.location.pathname).toEqual('/first')
})

it('return Promise<undefined> (user can leave, and action is re-dispatched)', async () => {
  const routesMap = {
    FIRST: {
      path: '/first',
      beforeLeave: () => Promise.resolve()
    },
    SECOND: '/second'
  }

  const { store, history } = await setupAll('/first', undefined, { routesMap })
  const action = await store.dispatch({ type: 'SECOND' })

  expect(action.type).toEqual('SECOND')

  const { type } = store.getState().location
  expect(type).toEqual('SECOND')
  expect(history.location.pathname).toEqual('/second')
})

it('return Promise<undefined> (user can leave, and action is re-dispatched) -- global', async () => {
  const beforeLeave = jest.fn(() => Promise.resolve())

  const { store, history } = await setupAll('/first', { beforeLeave })
  await store.dispatch({ type: 'SECOND', payload: { param: 'foo' } })

  const { type } = store.getState().location
  expect(type).toEqual('SECOND')
  expect(history.location.pathname).toEqual('/second/foo')
})

it('return Promise<false> (user CANNOT leave)', async () => {
  const routesMap = {
    FIRST: {
      path: '/first',
      beforeLeave: () => Promise.resolve(false)
    },
    SECOND: '/second'
  }

  const { store, history } = await setupAll('/first', undefined, { routesMap })
  const res = await store.dispatch({ type: 'SECOND' })

  expect(res).toEqual(false)

  const { type } = store.getState().location
  expect(type).toEqual('FIRST')
  expect(history.location.pathname).toEqual('/first')
})

it('return Promise<false> (user CANNOT leave) -- global', async () => {
  const beforeLeave = jest.fn(() => Promise.resolve(false))

  const { store, history } = await setupAll('/first', { beforeLeave })
  await store.dispatch({ type: 'SECOND', payload: { param: 'foo' } })

  const { type } = store.getState().location
  expect(type).toEqual('FIRST')
  expect(history.location.pathname).toEqual('/first')
})

it('return Promise<undefined> but users dispatches manually (user can leave, and action is NOT re-dispatched)', async () => {
  const routesMap = {
    FIRST: {
      path: '/first',
      beforeLeave: async ({ dispatch, getState, action }) => {
        await fakeAsyncWork()
      }
    },
    SECOND: '/second'
  }

  const { store, history } = await setupAll('/first', undefined, { routesMap })
  const action = await store.dispatch({ type: 'SECOND' })
  expect(action.type).toEqual('SECOND')

  const { type } = store.getState().location
  expect(type).toEqual('SECOND')
  expect(history.location.pathname).toEqual('/second')
})

it('HISTORY: return undefined (user can leave)', async () => {
  const routesMap = {
    FIRST: {
      path: '/first',
      beforeLeave: () => undefined
    },
    SECOND: '/second'
  }

  const { history, store } = await setupAll('/first', undefined, { routesMap })
  await history.push('/second')

  const { type } = store.getState().location
  expect(type).toEqual('SECOND')
  expect(history.location.pathname).toEqual('/second')
})

it('HISTORY: return false (use cannot leave until manual re-dispatch in timeout)', async () => {
  let futureDispatch
  let canLeave = false

  const routesMap = {
    FIRST: {
      path: '/first',
      beforeLeave: ({ dispatch, getState, action }) => {
        futureDispatch = () => dispatch(action)
        return canLeave
      }
    },
    SECOND: '/second'
  }

  const { store, history } = await setupAll('/first', undefined, { routesMap })
  await history.push('/second')

  expect(store.getState().location.type).toEqual('FIRST')
  expect(history.location.pathname).toEqual('/first')

  canLeave = true
  await futureDispatch()

  expect(store.getState().location.type).toEqual('SECOND')
  expect(history.location.pathname).toEqual('/second')
})

it('HISTORY: return Promise<undefined> (user can leave, and action is re-dispatched)', async () => {
  const routesMap = {
    FIRST: {
      path: '/first',
      beforeLeave: () => Promise.resolve()
    },
    SECOND: '/second'
  }

  const { store, history } = await setupAll('/first', undefined, { routesMap })
  await history.push('/second')

  const { type } = store.getState().location
  expect(type).toEqual('SECOND')
  expect(history.location.pathname).toEqual('/second')
})
