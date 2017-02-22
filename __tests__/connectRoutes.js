import { createStore, applyMiddleware } from 'redux'

import setup from '../__test-helpers__/setup'
import setupThunk from '../__test-helpers__/setupThunk'
import reducerParameters from '../__test-helpers__/reducerParameters'

import connectRoutes from '../src/connectRoutes'
import { NOT_FOUND } from '../src/index'


describe('middleware', () => {
  it('dispatches location-aware action, changes address bar + document.title', () => {
    const { middleware, history, reducer: locationReducer } = setup()
    const middlewares = applyMiddleware(middleware)

    const reducer = (state = {}, action = {}) => ({
      location: locationReducer(state.location, action),
      title: `title: ${action.type}`,
    })

    const store = createStore(reducer, middlewares)

    console.log(store.getState())

    expect(document.title).toEqual('')
    expect(history.location.pathname).toEqual('/')
    expect(store.getState().location).toMatchObject({
      pathname: '/',
      type: NOT_FOUND,
      payload: {},
    })

    const payload = { param: 'bar' }
    const action = store.dispatch({ type: 'SECOND', payload })

    console.log(action)
    console.log(action.meta)
    console.log(store.getState())

    expect(action).toMatchObject({
      type: 'SECOND',
      payload,
      meta: {
        location: {
          current: { pathname: '/second/bar', type: 'SECOND', payload },
          prev: { pathname: '', type: '', payload: {} },
          load: undefined,
          backNext: undefined,
        },
      },
    })

    expect(document.title).toEqual('title: SECOND')
    expect(history.location.pathname).toEqual('/second/bar')
    expect(store.getState()).toMatchObject({
      location: {
        pathname: '/second/bar',
        type: 'SECOND',
        payload,
        prev: { pathname: '', type: '', payload: {} },
        load: undefined,
        backNext: undefined,
        routesMap: { FIRST: '/first', SECOND: '/second/:param' },
      },
      title: 'title: SECOND',
    })

    expect(action).toMatchSnapshot()
    expect(store.getState()).toMatchSnapshot()
  })

  it('not matched received action dispatches the action as normal with no changes', () => {
    const { middleware, history, reducer: locationReducer } = setup('/first')
    const middlewares = applyMiddleware(middleware)
    const reducer = (state = {}, action = {}) => ({
      location: locationReducer(state.location, action),
      title: action.type,
    })

    const store = createStore(reducer, middlewares)

    console.log(history.location)
    console.log(store.getState())

    expect(history.location.pathname).toEqual('/first')
    expect(store.getState().location).toMatchObject({
      type: 'FIRST',
      pathname: '/first',
      payload: {},
    })

    const beforeState = store.getState().location
    const action = store.dispatch({ type: 'BLA' })
    const afterState = store.getState().location

    console.log(action)
    console.log(history.location)
    console.log(store.getState())

    expect(action).toEqual({ type: 'BLA' })             // final action returned from middleware is the same as initially dispatched
    expect(history.location.pathname).toEqual('/first') // window.location has not changed because action not matched
    expect(store.getState().location).toMatchObject({   // location state has not changed because action not matched
      type: 'FIRST',
      pathname: '/first',
      payload: {},
    })

    expect(afterState).toEqual(beforeState)
  })

  it('user dispatches NOT_FOUND and middleware adds missing info to action', () => {
    const { middleware, reducer: locationReducer } = setup()
    const middlewares = applyMiddleware(middleware)

    const reducer = (state = {}, action = {}) => ({
      location: locationReducer(state.location, action),
      title: action.type,
    })

    const store = createStore(reducer, middlewares)
    const action = store.dispatch({ type: NOT_FOUND })

    console.log(action)
    console.log(action.meta)
    console.log(store.getState())

    expect(action).toMatchObject({
      type: '@@pure-redux-router/NOT_FOUND',
      payload: {},
      meta: {
        location: {
          current: { pathname: '/', type: '@@pure-redux-router/NOT_FOUND', payload: {} },
          prev: { pathname: '', type: '', payload: {} },
          load: undefined,
          backNext: undefined,
        },
      },
    })

    expect(action).toMatchSnapshot()
  })

  it('does nothing and warns if action has error && dispatched action isLocationAction', () => {
    const { middleware, reducer: locationReducer } = setup()
    const middlewares = applyMiddleware(middleware)

    const reducer = (state = {}, action = {}) => ({
      location: locationReducer(state.location, action),
      title: action.type,
    })

    console.warn = jest.fn()
    const store = createStore(reducer, middlewares)
    const receivedAction = { error: true, type: 'FOO', meta: { location: {} } }
    const action = store.dispatch(receivedAction)
    const warnArg = console.warn.mock.calls[0][0]
    expect(warnArg).toEqual('pure-redux-router: location update did not dispatch as your action has an error.')

    console.log(action)
    expect(action).toEqual(receivedAction)
  })
})


describe('middleware -> _middlewareAttemptChangeUrl()', () => {
  it('when pathname changes push new pathname on to addressbar', () => {
    const { _middlewareAttemptChangeUrl } = setup('/')
    const locationState = { pathname: '/foo' }
    const history = []

    _middlewareAttemptChangeUrl(locationState, history)

    console.log(history)
    expect(history).toEqual([{ pathname: '/foo' }])
  })

  it('when pathname does not change, do not push pathname on to address bar', () => {
    const { _middlewareAttemptChangeUrl } = setup('/foo')
    const locationState = { pathname: '/foo' }
    const history = []

    _middlewareAttemptChangeUrl(locationState, history)

    console.log(history)
    expect(history).toEqual([])
  })
})


describe('enhancer', () => {
  it('dispatches location-aware action when store is first created so app is location aware on load', () => {
    const { enhancer, reducer: locationReducer } = setup('/first')

    const createStore = (reducer /* , initialState, enhancer */) => ({ // eslint-disable-line arrow-parens
      dispatch: jest.fn(),
      getState: () => reducer(),
    })

    const reducer = (state = {}, action = {}) => ({
      location: locationReducer(state.location, action),
    })

    const store = enhancer(createStore)(reducer)
    const action = store.dispatch.mock.calls[0][0]

    console.log(action)

    expect(action).toMatchObject({
      type: 'FIRST',
      payload: {},
      meta: {
        location: {
          current: {
            type: 'FIRST',
            payload: {},
            pathname: '/first',
          },
          load: true, // IMPORTANT: only dispatched on load
        },
      },
    })

    expect(action).toMatchSnapshot()
  })

  it('listens to history changes and dispatches actions matching history\'s location.pathname', () => {
    const { history, enhancer, reducer: locationReducer } = setup('/first')

    const createStore = (reducer /* , initialState, enhancer */) => ({ // eslint-disable-line arrow-parens
      dispatch: jest.fn(),
      getState: () => reducer(),
    })

    const reducer = (state = {}, action = {}) => ({
      location: locationReducer(state.location, action),
    })

    const store = enhancer(createStore)(reducer)

    history.push('/second/bar')

    let action = store.dispatch.mock.calls[1][0]
    console.log(action)

    expect(action).toMatchObject({
      type: 'SECOND',
      payload: { param: 'bar' },
      meta: {
        location: {
          current: {
            type: 'SECOND',
            payload: { param: 'bar' },
            pathname: '/second/bar',
          },
          prev: {
            type: 'FIRST',
            payload: {},
            pathname: '/first',
          },
          backNext: true,  // IMPORTANT: only dispatched when using browser back/forward buttons
        },
      },
    })

    expect(action).toMatchSnapshot()

    history.goBack()
    action = store.dispatch.mock.calls[2][0]

    console.log(action)
    expect(action.type).toEqual('FIRST')
    expect(action.meta.location.current.pathname).toEqual('/first')
  })

  it('throws when no location reducer provided', () => {
    const { enhancer, reducer: locationReducer } = setup('/first')

    const createStore = (reducer /* , initialState, enhancer */) => ({ // eslint-disable-line arrow-parens
      dispatch: jest.fn(),
      getState: () => reducer(),
    })

    const reducer = (state = {}, action = {}) => ({
      locationFOO: locationReducer(state.location, action),
    })

    const createEnhancer = () => enhancer(createStore)(reducer)
    expect(createEnhancer).toThrowError()
  })

  it('on the client correctly assigns routesMap to preloadedState so that functions in stringified server state are put back', () => {
    const { enhancer, reducer: locationReducer } = setup('/first')

    const createStore = (reducer /* , initialState, enhancer */) => ({ // eslint-disable-line arrow-parens
      dispatch: jest.fn(),
      getState: () => reducer(),
    })

    const reducer = (state = {}, action = {}) => ({
      location: locationReducer(state.location, action),
    })

    const preloadedState = { location: {} }
    enhancer(createStore)(reducer, preloadedState)

    console.log(preloadedState)
    expect(preloadedState.location.routesMap).toBeDefined()
  })
})


describe('enhancer -> _historyAttemptDispatchAction()', () => {
  it('dispatches action matching pathname when history location changes', () => {
    const dispatch = jest.fn()
    const historyLocation = { pathname: '/second/foo' }
    const { _historyAttemptDispatchAction } = setup()

    _historyAttemptDispatchAction(dispatch, historyLocation)

    const action = dispatch.mock.calls[0][0]
    console.log(action)

    expect(action.type).toEqual('SECOND')
    expect(action.payload).toEqual({ param: 'foo' })
    expect(action.meta.location.backNext).toEqual(true)

    expect(action).toMatchSnapshot()
  })

  it('does not dispatch if pathname is the same (i.e. was handled by middleware already)', () => {
    const dispatch = jest.fn()
    const historyLocation = { pathname: '/second/foo' }
    const { _historyAttemptDispatchAction } = setup()

    _historyAttemptDispatchAction(jest.fn(), historyLocation)
    _historyAttemptDispatchAction(dispatch, historyLocation)

    // insure multiple dispatches are prevented for the same action/pathname
    // so that middleware and history listener don't double dispatch
    console.log(dispatch.mock.calls)
    expect(dispatch.mock.calls).toEqual([])
  })

  it('calls onBackNext handler with location object on path change', () => {
    const dispatch = jest.fn()
    const historyLocation = { pathname: '/second/foo' }
    const onBackNext = jest.fn()
    const { _historyAttemptDispatchAction } = setup('/', { onBackNext })

    _historyAttemptDispatchAction(dispatch, historyLocation)

    const args = onBackNext.mock.calls[0]
    const action = args[0]
    const histLocation = args[1]

    console.log(action)
    console.log(histLocation)

    expect(action.meta.location.current.pathname).toEqual('/second/foo')
    expect(histLocation.pathname).toEqual('/second/foo')
  })
})


describe('thunk', () => {
  it('middleware:attemptCallRouteThunk DOES calls thunk if locationState.load && !locationState.hasSSR', () => {
    const thunk = jest.fn()
    setupThunk('/second/bar', thunk)

    console.log(thunk.mock.calls[0])

    expect(thunk.mock.calls).not.toEqual([])
    expect(thunk.mock.calls.length).toEqual(1)
    expect(thunk.mock.calls[0].length).toEqual(2)
  })

  it('middleware:attemptCallRouteThunk does NOT call thunk if locationState.load && locationState.hasSSR', () => {
    const thunk = jest.fn()

    global.window.SSRtest = true
    const { store } = setupThunk('/second/bar', thunk)
    delete global.window.SSRtest

    console.log(store.getState())
    console.log(thunk.mock.calls)

    expect(thunk.mock.calls).toEqual([])
  })

  it('middleware:attemptCallRouteThunk DOES call thunk if !locationState.load', () => {
    const thunk = jest.fn()
    const { store } = setupThunk('/first', thunk)

    const action = { type: 'SECOND', payload: { param: 'bar' } }
    store.dispatch(action)

    console.log(store.getState())
    console.log(thunk.mock.calls[0])

    expect(thunk.mock.calls).not.toEqual([])
    expect(thunk.mock.calls[0].length).toEqual(2)
  })

  it('attemptCallRouteThunk calls thunk with same `dispatch` argument as in middleware chain', () => {
    const thunk = jest.fn((dispatch, getState) => {
      const action = { type: 'THIRD', payload: { param: 'hurray' } }
      dispatch(action)

      return getState()
    })

    const { store } = setupThunk('/first', thunk)

    // thunk will be called
    const action = { type: 'SECOND', payload: { param: 'bar' } }
    store.dispatch(action)

    const { location } = store.getState()
    console.log(location)

    // expect state matched that was dispatched in thunk
    expect(location.type).toEqual('THIRD')
    expect(location.pathname).toEqual('/third/hurray')
  })

  it('simulate server side manual usage of thunk via `await connectRoutes().thunk` (to be used when: locationState.load && locationState.hasSSR)', async () => {
    const thunk = jest.fn(async (dispatch, getState) => {
      const action = { type: 'THIRD', payload: { param: 'hurray' } }
      dispatch(action)

      return await Promise.resolve(getState()) // not really needed, but it's important we are testing what a thunk returning a promise looks like
    })

    global.window.SSRtest = true
    const { store, thunk: ssrThunk } = setupThunk('/second/bar', thunk)
    delete global.window.SSRtest

    // verify thunk has not been called yet
    const { location } = store.getState()
    console.log(location)
    expect(location.pathname).toEqual('/second/bar')

    // verify our manual calling of thunk via `await` has been called to simulate server side usage
    const state = await ssrThunk(store)
    console.log(state)

    expect(state.location.pathname).toEqual('/third/hurray')
    expect(state.location.type).toEqual('THIRD')
    expect(state).toEqual(store.getState())
  })

  it('verify server side call of `await connectRoutes().thunk` returns a promise even if route does not have a thunk', async () => {
    global.window.SSRtest = true
    const { store, thunk: ssrThunk } = setupThunk('/first')
    delete global.window.SSRtest

    // promise resolving to undefined returned
    const ret = await ssrThunk(store)
    console.log(ret)
    expect(ret).not.toBeDefined()
  })
})


describe('reducer', () => {
  it('reducer EXISTS and works (see __tests__/createLocationReducer for all its tests)', () => {
    const { reducer } = setup()
    const {
      action,
      expectState,
    } = reducerParameters('SECOND', '/second/bar')

    const state = reducer(undefined, action)

    console.log(state)
    expectState(state)
  })
})


it('_exportedGo EXISTS and works (see __tests__/clientOnlyApi for `go` function)', () => {
  const { _exportedGo } = setup()
  const action = _exportedGo('/first')

  console.log(action)
  expect(action).toEqual({ type: 'FIRST', payload: {} })
})


it('connectRoutes(undefined): throw error if no history provided', () => {
  expect(() => connectRoutes()).toThrowError()
})
