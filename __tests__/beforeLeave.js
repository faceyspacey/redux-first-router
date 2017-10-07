import fakeAsyncWork from '../__test-helpers__/fakeAsyncWork'

let setupAll

beforeEach(() => {
  jest.useRealTimers()
  jest.resetModules()
  setupAll = require('../__test-helpers__/setup').setupAll
})

it('return undefined (user can leave)', () => {
  const beforeLeave = jest.fn()
  const routesMap = {
    FIRST: {
      path: '/first',
      beforeLeave
    },
    SECOND: '/second'
  }

  const { store, history } = setupAll('/first', undefined, { routesMap })
  store.dispatch({ type: 'SECOND' })

  const { type } = store.getState().location
  expect(type).toEqual('SECOND')
  expect(history.location.pathname).toEqual('/second')
  expect(beforeLeave).toHaveBeenCalledTimes(1)
})

it('return undefined (user can leave) -- global', () => {
  const beforeLeave = jest.fn()

  const { store, history } = setupAll('/first', { beforeLeave })
  store.dispatch({ type: 'SECOND', payload: { param: 'foo' } })

  const { type } = store.getState().location
  expect(type).toEqual('SECOND')
  expect(history.location.pathname).toEqual('/second/foo')
  expect(beforeLeave).toHaveBeenCalledTimes(1)
})

it('return false (use cannot leave until manual re-dispatch in timeout)', () => {
  jest.useFakeTimers()

  const routesMap = {
    FIRST: {
      path: '/first',
      beforeLeave: (dispatch, getState, { action }) => {
        setTimeout(() => dispatch(action), 1)
        return false
      }
    },
    SECOND: '/second'
  }

  const { store, history } = setupAll('/first', undefined, { routesMap })
  const res = store.dispatch({ type: 'SECOND' })
  expect(res).toEqual(false)

  expect(store.getState().location.type).toEqual('FIRST')
  expect(history.location.pathname).toEqual('/first')

  jest.runAllTimers()

  expect(store.getState().location.type).toEqual('SECOND')
  expect(history.location.pathname).toEqual('/second')
})

it('return false (user cannot leave) -- global', () => {
  const beforeLeave = jest.fn(() => false)

  const { store, history } = setupAll('/first', { beforeLeave })
  store.dispatch({ type: 'SECOND', payload: { param: 'foo' } })

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

  const { store, history } = setupAll('/first', undefined, { routesMap })
  const action = await store.dispatch({ type: 'SECOND' })

  expect(action.type).toEqual('SECOND')

  const { type } = store.getState().location
  expect(type).toEqual('SECOND')
  expect(history.location.pathname).toEqual('/second')
})

it('return Promise<undefined> (user can leave, and action is re-dispatched) -- global', async () => {
  const beforeLeave = jest.fn(() => Promise.resolve())

  const { store, history } = setupAll('/first', { beforeLeave })
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

  const { store, history } = setupAll('/first', undefined, { routesMap })
  const res = await store.dispatch({ type: 'SECOND' })

  expect(res).toEqual(false)

  const { type } = store.getState().location
  expect(type).toEqual('FIRST')
  expect(history.location.pathname).toEqual('/first')
})

it('return Promise<false> (user CANNOT leave) -- global', async () => {
  const beforeLeave = jest.fn(() => Promise.resolve(false))

  const { store, history } = setupAll('/first', { beforeLeave })
  await store.dispatch({ type: 'SECOND', payload: { param: 'foo' } })

  const { type } = store.getState().location
  expect(type).toEqual('FIRST')
  expect(history.location.pathname).toEqual('/first')
})

it('return Promise<undefined> but users dispatches manually (user can leave, and action is NOT re-dispatched)', async () => {
  const routesMap = {
    FIRST: {
      path: '/first',
      beforeLeave: async (dispatch, getState, { action }) => {
        await fakeAsyncWork()
        return dispatch(action)
      }
    },
    SECOND: '/second'
  }

  const { store, history } = setupAll('/first', undefined, { routesMap })
  const action = await store.dispatch({ type: 'SECOND' })

  expect(action.type).toEqual('SECOND')

  const { type } = store.getState().location
  expect(type).toEqual('SECOND')
  expect(history.location.pathname).toEqual('/second')
})

it('HISTORY: return undefined (user can leave)', () => {
  const routesMap = {
    FIRST: {
      path: '/first',
      beforeLeave: () => undefined
    },
    SECOND: '/second'
  }

  const { history, store } = setupAll('/first', undefined, { routesMap })
  history.push('/second')

  const { type } = store.getState().location
  expect(type).toEqual('SECOND')
})

it('HISTORY: return false (use cannot leave until manual re-dispatch in timeout)', () => {
  jest.useFakeTimers()

  const routesMap = {
    FIRST: {
      path: '/first',
      beforeLeave: (dispatch, getState, { action }) => {
        setTimeout(() => dispatch(action), 1)
        return false
      }
    },
    SECOND: '/second'
  }

  const { store, history } = setupAll('/first', undefined, { routesMap })
  history.push('/second')

  expect(store.getState().location.type).toEqual('FIRST')
  expect(history.location.pathname).toEqual('/first')

  jest.runAllTimers()

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

  const { store, history } = setupAll('/first', undefined, { routesMap })
  history.push('/second') // you can't really await this, but it does happen in the next tick, which is good enough for the test

  // fake way to wait until Promise.resolve() + Promise.all() (used by `callBeforeLeave`) are complete
  await 1
  await 1

  const { type } = store.getState().location
  expect(type).toEqual('SECOND')
  expect(history.location.pathname).toEqual('/second')
})
