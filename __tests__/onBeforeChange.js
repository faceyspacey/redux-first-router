import { setupAll } from '../__test-helpers__/setup'
import fakeAsyncWork from '../__test-helpers__/fakeAsyncWork'
import tempMock from '../__test-helpers__/tempMock'

it('calls onBeforeChange handler on route change', () => {
  const onBeforeChange = jest.fn()
  const { store } = setupAll('/first', { onBeforeChange })

  const action = { type: 'SECOND', payload: { param: 'bar' } }
  store.dispatch(action)

  expect(onBeforeChange).toHaveBeenCalled()
  expect(onBeforeChange.mock.calls[1][2].action).toMatchObject(action)
  expect(onBeforeChange.mock.calls[1][2].arg).toEqual('extra-arg')
})

it('if onBeforeChange dispatches redirect, route changes with kind === "redirect"', async () => {
  const onBeforeChange = jest.fn((dispatch, getState, { action }) => {
    if (action.type !== 'SECOND') return
    dispatch({ type: 'THIRD' })
  })

  const { store, history } = setupAll('/first', { onBeforeChange })
  await store.dispatch({ type: 'SECOND', payload: { param: 'bar' } })
  const { location } = store.getState()

  expect(location.kind).toEqual('redirect')
  expect(location.type).toEqual('THIRD')
  expect(history.entries.length).toEqual(2)
  expect(location).toMatchSnapshot()
  expect(onBeforeChange.mock.calls.length).toEqual(3)
})

it('onBeforeChange redirect on server results in 1 history entry', async () => {
  tempMock('../src/pure-utils/isServer', () => () => true)
  const { setupAll } = require('../__test-helpers__/setup')

  const onBeforeChange = jest.fn((dispatch, getState, { action }) => {
    if (action.type !== 'SECOND') return
    dispatch({ type: 'THIRD' })
  })

  const { store, history } = setupAll('/first', {
    onBeforeChange
  })

  await store.dispatch({ type: 'SECOND', payload: { param: 'bar' } })

  const { location } = store.getState()
  expect(history.entries.length).toEqual(1) // what we are testing for
  expect(location).toMatchSnapshot()
})

it('onBeforeChange delays route changes until onBeforeChange promise resolves', async () => {
  const onBeforeChange = jest.fn(async (dispatch, getState, { action }) => {
    if (action.type !== 'SECOND') return

    await fakeAsyncWork()
    dispatch({ type: 'NON_ROUTE_AUTH_ACTION' })
  })

  const routesMap = {
    FIRST: '/first',
    SECOND: {
      path: '/second',
      thunk: async (dispatch, getState) => {
        await fakeAsyncWork()
        return 'thunkReturn'
      }
    }
  }

  const { store } = setupAll('/first', { onBeforeChange }, { routesMap })

  const prom = store.dispatch({ type: 'SECOND' })
  expect(store.getState().location.type).toEqual('FIRST')

  const res = await prom
  expect(res).toEqual('thunkReturn')
  expect(store.getState().location.type).toEqual('SECOND')
  expect(store.getState().location.kind).toEqual('push')

  // VERY IMPORTANT:
  // there will be 4 dispatches, but only 2 calls to `onBeforeChange`:
  // - 1 initialDispatch in setupAll
  // - 2 externally by the user (SECOND, SOME_NON_ROUTE_TYPE_SUCH_AS_AUTH_STUFF)
  // - and 1 additional by the middleware to re-dispatch SECOND
  expect(onBeforeChange.mock.calls.length).toEqual(2)
})

it('onBeforeChange that returns a promise which redirects', async () => {
  const onBeforeChange = jest.fn(async (dispatch, getState, { action }) => {
    if (action.type !== 'SECOND') return

    await fakeAsyncWork()
    dispatch({ type: 'THIRD' })
  })

  const routesMap = {
    FIRST: '/first',
    SECOND: '/second',
    THIRD: {
      path: '/third',
      thunk: async (dispatch, getState) => {
        await fakeAsyncWork()
        return 'onBeforeChangePlusThunkReturn'
      }
    }
  }

  const { store } = setupAll('/first', { onBeforeChange }, { routesMap })

  expect(store.getState().location.type).toEqual('FIRST')

  const res = await store.dispatch({ type: 'SECOND' })
  expect(res).toEqual('onBeforeChangePlusThunkReturn')
  expect(store.getState().location.type).toEqual('THIRD')
  expect(store.getState().location.kind).toEqual('redirect')

  // VERY IMPORTANT:
  // we expect `onBeforeChange` to be called 3 times, because even the final/3rd
  // route redirected to must be filtered again. In the final route, there are no more
  // redirects so it passes the filtering.
  expect(onBeforeChange.mock.calls.length).toEqual(3)
})
