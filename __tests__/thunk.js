import { setupAll } from '../__test-helpers__/setup'
import setupThunk from '../__test-helpers__/setupThunk'
import fakeAsyncWork from '../__test-helpers__/fakeAsyncWork'
import tempMock from '../__test-helpers__/tempMock'

import redirect from '../src/action-creators/redirect'

it('middleware:callThunk', () => {
  const thunk = jest.fn(dispatch => {
    dispatch({ type: 'NON_ROUTE_ACTION' })
  })
  const { store } = setupThunk('/second/bar', thunk)
  expect(thunk).toBeCalled()
  expect(store.getState().location.type).toEqual('SECOND') // route stays the same (i.e. no redirect)
})

it('middleware:callThunk does NOT call thunk + change callback if isClientLoadSSR', () => {
  jest.resetModules()
  jest.doMock('../src/pure-utils/isClientLoadSSR', () => () => true)
  jest.doMock('../src/pure-utils/isServer', () => () => false)
  const { setupAll } = require('../__test-helpers__/setup')

  const thunk = jest.fn()
  const onBeforeChange = jest.fn()
  const onAfterChange = jest.fn()

  const routeThunk = jest.fn()
  const routeOnBeforeChange = jest.fn()
  const routeOnAfterChange = jest.fn()

  const routesMap = {
    FIRST: {
      path: '/first',
      onBeforeChange: routeOnBeforeChange,
      thunk: routeThunk,
      onAfterChange: routeOnAfterChange
    }
  }

  const options = {
    onBeforeChange,
    thunk,
    onAfterChange
  }

  const setupOptions = { routesMap, dispatchFirstRoute: false }
  const { store, firstRoute } = setupAll('/first', options, setupOptions)

  store.dispatch(firstRoute())

  expect(onBeforeChange).not.toBeCalled()
  expect(thunk).not.toBeCalled()
  expect(onAfterChange).not.toBeCalled()

  expect(routeOnBeforeChange).not.toBeCalled()
  expect(routeThunk).not.toBeCalled()
  expect(routeOnAfterChange).not.toBeCalled()
})

it('middleware:callThunk DOES call thunk if locationState.kind !== "load"', () => {
  const thunk = jest.fn()
  const { store } = setupThunk('/first', thunk)

  const action = { type: 'SECOND', payload: { param: 'bar' } }
  store.dispatch(action)

  store.getState() /*? */

  expect(thunk).toBeCalled()
})

it('callThunk calls thunk with same `dispatch` argument as in middleware chain', () => {
  const thunk = jest.fn((dispatch, getState) => {
    const action = { type: 'THIRD', payload: { param: 'hurray' } }
    dispatch(action)

    return getState()
  })

  const { store } = setupThunk('/first', thunk)

  // thunk will be called
  const action = { type: 'SECOND', payload: { param: 'bar' } }
  store.dispatch(action)

  const { location } = store.getState() /*? $.location */

  // expect state matched that was dispatched in thunk
  expect(location.type).toEqual('THIRD')
  expect(location.pathname).toEqual('/third/hurray')
  expect(thunk).toHaveBeenCalled()
  expect(thunk.mock.calls[0].length).toEqual(3)
  expect(thunk.mock.calls[0][2].action).toMatchObject(action)
  expect(thunk.mock.calls[0][2].arg).toEqual('extra-arg')
})

it('pathless route calls callThunk', () => {
  const thunk = jest.fn()
  const routesMap = {
    FIRST: '/',
    PATHLESS: {
      thunk
    }
  }

  const { store, history } = setupAll('/', undefined, { routesMap })
  const action = { type: 'PATHLESS' }
  store.dispatch(action)

  expect(thunk).toHaveBeenCalled()
  expect(thunk.mock.calls[0].length).toEqual(3) // 2 args: dispatch, getState
  expect(thunk.mock.calls[0][2].action).toEqual(action)
})

it('pathless routes do not break other real route dispatches', () => {
  const thunk = jest.fn()
  const routesMap = {
    FIRST: '/',
    SECOND: '/second',
    PATHLESS: {
      thunk
    }
  }

  const { store, history } = setupAll('/', undefined, { routesMap })
  store.dispatch({ type: 'SECOND' })

  const { type } = store.getState().location
  expect(type).toEqual('SECOND')
})

it('pathless routes do not break history changes from real route dispatches', () => {
  const thunk = jest.fn()
  const routesMap = {
    FIRST: '/',
    SECOND: '/second',
    PATHLESS: {
      thunk
    }
  }

  const { store, history } = setupAll('/', undefined, { routesMap })
  history.push('/second')

  const { type } = store.getState().location
  expect(type).toEqual('SECOND')
})

it('simulate server side manual usage of thunk via `await dispatch(firstRoute())`', async () => {
  jest.resetModules()
  jest.dontMock('../src/pure-utils/isClientLoadSSR') // weird jest bug from above mocking of same module. you shouldnt need to do this after restModules
  jest.doMock('../src/pure-utils/isServer', () => () => true)
  const { setupAll } = require('../__test-helpers__/setup')

  const thunk1 = jest.fn(async (dispatch, getState) => {
    await fakeAsyncWork()
    return dispatch({ type: 'THIRD' }) // key ingredient: users must insure their thunks await a redirect dispatch so its thunk (if also async) is awaited
  })

  const thunk2 = jest.fn(async (dispatch, getState) => {
    await fakeAsyncWork()
    return 'thunk2called'
  })

  const routesMap = {
    FIRST: '/first',
    SECOND: { path: '/second', thunk: thunk1 },
    THIRD: { path: '/third', thunk: thunk2 }
  }

  const setupOptions = { routesMap, dispatchFirstRoute: false }
  const { store, firstRoute } = setupAll('/second', undefined, setupOptions)

  // verify first route (and its thunk) has not been dispatched
  const { location } = store.getState() /*? */
  expect(location.pathname).toEqual('/second') // pathname will be correct because initialReducer state

  // but the thunk which rediects won't be called until now
  const res = await store.dispatch(firstRoute())
  const state = store.getState()

  // we'll only reach the state of the true first route here:
  expect(state.location.pathname).toEqual('/third')
  expect(state.location.type).toEqual('THIRD')
  expect(state.location.kind).toEqual('redirect')
  expect(state.location).toMatchSnapshot()
  // verify second thunk is also called. This is dependent on the user returning their first thunk's
  // dispatch, which isnt required, unless they want the result in the following line like here:
  expect(res).toEqual('thunk2called')

  expect(thunk1.mock.calls.length).toEqual(1)
  expect(thunk2.mock.calls.length).toEqual(1)
})

it('dispatched thunk performs redirect with history.replace(path)', () => {
  const thunk = jest.fn(dispatch => {
    const action = redirect({
      type: 'THIRD',
      payload: { param: 'hurray' }
    }) /*? */
    dispatch(action)
  })
  const { store, history } = setupThunk('/first', thunk)

  const action = { type: 'SECOND', payload: { param: 'bar' } }
  store.dispatch(action)

  const { location } = store.getState() /*? */
  expect(location.kind).toEqual('redirect')
  expect(location.pathname).toEqual('/third/hurray')

  expect(history.length).toEqual(2) // if it wasn't a redirect, the length would be 3!
  expect(history.entries[1].pathname).toEqual('/third/hurray')
})
