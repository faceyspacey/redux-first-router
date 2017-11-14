import { setupAll } from '../__test-helpers__/setup'
import fakeAsyncWork from '../__test-helpers__/fakeAsyncWork'
import tempMock from '../__test-helpers__/tempMock'
import doesRedirect from '../src/utils/doesRedirect'

it('calls beforeEnter handler on route change -- route', async () => {
  const beforeEnter = jest.fn()

  const routesMap = {
    FIRST: '/first',
    SECOND: {
      path: '/second',
      beforeEnter
    },
    THIRD: '/third'
  }

  const { store } = await setupAll('/first', undefined, { routesMap })

  const action = { type: 'SECOND' }
  await store.dispatch(action)

  expect(beforeEnter).toHaveBeenCalled()
  expect(beforeEnter.mock.calls[0][0].action).toMatchObject(action)
  expect(beforeEnter.mock.calls[0][0].arg).toEqual('extra-arg')
})

it('calls beforeEnter handler on route change -- global', async () => {
  const beforeEnter = jest.fn()
  const { store } = await setupAll('/first', { beforeEnter })

  const action = { type: 'SECOND', payload: { param: 'bar' } }
  await store.dispatch(action)

  expect(beforeEnter).toHaveBeenCalled()
  expect(beforeEnter.mock.calls[1][0].action).toMatchObject(action)
  expect(beforeEnter.mock.calls[1][0].arg).toEqual('extra-arg')
})

it('if beforeEnter dispatches redirect, route changes with kind === "redirect"', async () => {
  const beforeEnter = jest.fn(({ dispatch, getState, action }) => {
    if (action.type !== 'SECOND') return
    return { type: 'THIRD' } // returned plain objects automatically dispatched
  })

  const { store, history } = await setupAll('/first', { beforeEnter })
  const action = await store.dispatch({ type: 'SECOND', payload: { param: 'bar' } })
  const { location } = store.getState()

  expect(action.type).toEqual('THIRD')

  expect(location.kind).toEqual('redirect')
  expect(location.type).toEqual('THIRD')
  expect(history.entries.length).toEqual(2)
  expect(location).toMatchSnapshot()
  expect(beforeEnter.mock.calls.length).toEqual(3)
})

it('beforeEnter redirect on server results does not update state, and instead returns action (i.e. short-circuits)', async () => {
  tempMock('../src/utils/isServer', () => () => true)
  const { setupAll } = require('../__test-helpers__/setup')

  const beforeEnter = jest.fn(({ dispatch, getState, action }) => {
    if (action.type !== 'SECOND') return
    dispatch({ type: 'THIRD' })
  })

  const { store, history } = await setupAll('/first', {
    beforeEnter
  })

  const action = await store.dispatch({
    type: 'SECOND',
    payload: { param: 'bar' }
  })

  const { location } = store.getState()
  expect(history.entries.length).toEqual(1)
  expect(action.kind).toEqual('redirect')
  expect(action.type).toEqual('THIRD')
  expect(action.meta.location.status).toEqual(302)
  expect(action.meta.location.url).toEqual('/third')

  const redirect = jest.fn()
  expect(doesRedirect(action, redirect)).toEqual(true)
  expect(redirect).toBeCalledWith(302, '/third')

  expect(location.type).toEqual('FIRST')
  expect(location).toMatchSnapshot()
  expect(action).toMatchSnapshot()
})

it('beforeEnter delays route changes until beforeEnter promise resolves', async () => {
  const beforeEnter = jest.fn(async ({ dispatch, getState, action }) => {
    if (action.type !== 'SECOND') return

    await fakeAsyncWork()
    dispatch({ type: 'NON_ROUTE_AUTH_ACTION' })
  })

  const routesMap = {
    FIRST: '/first',
    SECOND: {
      path: '/second',
      thunk: async ({ dispatch, getState }) => {
        await fakeAsyncWork()
        return 'thunkReturn'
      }
    }
  }

  const { store } = await setupAll('/first', { beforeEnter }, { routesMap })

  const prom = store.dispatch({ type: 'SECOND' })
  expect(store.getState().location.type).toEqual('FIRST')

  const res = await prom
  expect(res.payload).toEqual('thunkReturn')
  expect(res.type).toEqual('SECOND_COMPLETE')
  expect(store.getState().location.type).toEqual('SECOND')
  expect(store.getState().location.kind).toEqual('push')

  // VERY IMPORTANT:
  // there will be 4 dispatches, but only 2 calls to `beforeEnter`:
  // - 1 initialDispatch in setupAll
  // - 2 externally by the user (SECOND, SOME_NON_ROUTE_TYPE_SUCH_AS_AUTH_STUFF)
  // - and 1 additional by the middleware to re-dispatch SECOND
  expect(beforeEnter.mock.calls.length).toEqual(2)
})

it('beforeEnter that returns a promise which redirects', async () => {
  const beforeEnter = jest.fn(async ({ dispatch, getState, action }) => {
    if (action.type !== 'SECOND') return

    await fakeAsyncWork()
    return { type: 'THIRD' } // returned plain objects automatically dispatched
  })

  const routesMap = {
    FIRST: '/first',
    SECOND: '/second',
    THIRD: {
      path: '/third',
      thunk: async (dispatch, getState) => {
        await fakeAsyncWork()
        return 'beforeEnterPlusThunkReturn'
      }
    }
  }

  const { store } = await setupAll('/first', { beforeEnter }, { routesMap })

  expect(store.getState().location.type).toEqual('FIRST')

  const res = await store.dispatch({ type: 'SECOND' })
  expect(res.payload).toEqual('beforeEnterPlusThunkReturn')
  expect(res.type).toEqual('THIRD_COMPLETE')
  expect(store.getState().location.type).toEqual('THIRD')
  expect(store.getState().location.kind).toEqual('redirect')

  // VERY IMPORTANT:
  // we expect `beforeEnter` to be called 3 times, because even the final/3rd
  // route redirected to must be filtered again. In the final route, there are no more
  // redirects so it passes the filtering.
  expect(beforeEnter.mock.calls.length).toEqual(3)
})
