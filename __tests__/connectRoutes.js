import { createStore, applyMiddleware } from 'redux'
import { createMemoryHistory } from 'history'

import setup from '../__test-helpers__/setup'
import setupThunk from '../__test-helpers__/setupThunk'
import reducerParameters from '../__test-helpers__/reducerParameters'

import connectRoutes from '../src/connectRoutes'
import { NOT_FOUND } from '../src/index'
import redirect from '../src/action-creators/redirect'

describe('middleware', () => {
  it('dispatches location-aware action, changes address bar + document.title', () => {
    const { middleware, history, reducer } = setup()
    const middlewares = applyMiddleware(middleware)

    const rootReducer = (state = {}, action = {}) => ({
      location: reducer(state.location, action),
      title: `title: ${action.type}`
    })

    const store = createStore(rootReducer, middlewares) /*? $.getState() */

    expect(document.title).toEqual('')
    expect(history.location.pathname).toEqual('/')
    expect(store.getState().location).toMatchObject({
      pathname: '/',
      type: NOT_FOUND,
      payload: {}
    })

    const payload = { param: 'bar' }
    const action = store.dispatch({ type: 'SECOND', payload }) /*? $.meta */

    store.getState() /*? */

    expect(action).toMatchObject({
      type: 'SECOND',
      payload,
      meta: {
        location: {
          current: { pathname: '/second/bar', type: 'SECOND', payload },
          prev: { pathname: '', type: '', payload: {} },
          kind: 'push'
        }
      }
    })

    expect(history.location.pathname).toEqual('/second/bar')
    expect(store.getState()).toMatchObject({
      location: {
        pathname: '/second/bar',
        type: 'SECOND',
        payload,
        prev: { pathname: '', type: '', payload: {} },
        kind: 'push',
        routesMap: { FIRST: '/first', SECOND: '/second/:param' }
      },
      title: 'title: SECOND'
    })

    expect(action).toMatchSnapshot()
    expect(store.getState()).toMatchSnapshot()
  })

  it('not matched received action dispatches the action as normal with no changes', () => {
    const { middleware, history, reducer } = setup('/first')
    const middlewares = applyMiddleware(middleware)
    const rootReducer = (state = {}, action = {}) => ({
      location: reducer(state.location, action),
      title: action.type
    })

    const store = createStore(
      rootReducer,
      middlewares
    ) /*? $.getState().location */

    expect(history.location.pathname).toEqual('/first')
    expect(store.getState().location).toMatchObject({
      type: 'FIRST',
      pathname: '/first',
      payload: {}
    })

    const beforeState = store.getState().location
    const action = store.dispatch({ type: 'BLA' }) /*? */
    const afterState = store.getState().location /*? */

    expect(action).toEqual({ type: 'BLA' }) // final action returned from middleware is the same as initially dispatched
    expect(history.location.pathname).toEqual('/first') // window.location has not changed because action not matched
    expect(store.getState().location).toMatchObject({
      // location state has not changed because action not matched
      type: 'FIRST',
      pathname: '/first',
      payload: {}
    })

    expect(afterState).toEqual(beforeState)
  })

  it('user dispatches NOT_FOUND and middleware adds missing info to action', () => {
    const { middleware, reducer, enhancer } = setup('/first')
    const middlewares = applyMiddleware(middleware)

    const rootReducer = (state = {}, action = {}) => ({
      location: reducer(state.location, action),
      title: action.type
    })

    const store = createStore(rootReducer, middlewares, enhancer)
    const action = store.dispatch({ type: NOT_FOUND }) /*? $.meta */

    store.getState() /*? $.location */

    expect(action).toMatchSnapshot()
  })

  it('does nothing and warns if action has error && dispatched action isLocationAction', () => {
    const { middleware, reducer } = setup()
    const middlewares = applyMiddleware(middleware)

    const rootReducer = (state = {}, action = {}) => ({
      location: reducer(state.location, action),
      title: action.type
    })

    console.warn = jest.fn()
    const store = createStore(rootReducer, middlewares)
    const receivedAction = {
      error: true,
      type: 'FOO',
      meta: { location: { current: {} } }
    }
    const action = store.dispatch(receivedAction) /*? */
    const warnArg = console.warn.mock.calls[0][0] /*? */
    expect(warnArg).toEqual(
      'redux-first-router: location update did not dispatch as your action has an error.'
    )

    expect(action).toEqual(receivedAction)
  })

  it('calls onBeforeChange handler on route change', () => {
    const onBeforeChange = jest.fn()
    const { middleware, reducer } = setup('/first', { onBeforeChange })
    const middlewares = applyMiddleware(middleware)

    const rootReducer = (state = {}, action = {}) => ({
      location: reducer(state.location, action),
      title: action.type
    })

    const store = createStore(rootReducer, middlewares)
    store.dispatch({ type: 'SECOND', payload: { param: 'bar' } })

    expect(onBeforeChange).toHaveBeenCalled()
  })

  it('calls onAfterChange handler on route change', () => {
    const onAfterChange = jest.fn()
    const { middleware, reducer } = setup('/first', { onAfterChange })
    const middlewares = applyMiddleware(middleware)

    const rootReducer = (state = {}, action = {}) => ({
      location: reducer(state.location, action),
      title: action.type
    })

    const store = createStore(rootReducer, middlewares)

    // jest.useFakeTimers()
    store.dispatch({ type: 'SECOND', payload: { param: 'bar' } })
    // jest.runAllTimers()

    expect(onAfterChange).toHaveBeenCalled()
  })

  it('scrolls to top on route change when options.scrollTop === true', () => {
    const scrollTo = jest.fn()
    window.scrollTo = scrollTo
    const { middleware, reducer } = setup('/first', { scrollTop: true })
    const middlewares = applyMiddleware(middleware)

    const rootReducer = (state = {}, action = {}) => ({
      location: reducer(state.location, action),
      title: action.type
    })

    const store = createStore(rootReducer, middlewares)

    jest.useFakeTimers()
    store.dispatch({ type: 'SECOND', payload: { param: 'bar' } })
    jest.runAllTimers()

    expect(scrollTo).toHaveBeenCalled()
  })
})

describe('middleware -> _middlewareAttemptChangeUrl()', () => {
  it('when pathname changes push new pathname on to addressbar', () => {
    const { _middlewareAttemptChangeUrl } = setup('/')
    const actionMetaLocation = { current: { pathname: '/foo' } }
    const history = createMemoryHistory()

    _middlewareAttemptChangeUrl(actionMetaLocation, history)

    expect(history.entries[1].pathname).toEqual('/foo')
  })

  it('when pathname does not change, do not push pathname on to address bar', () => {
    const { _middlewareAttemptChangeUrl } = setup('/foo')
    const actionMetaLocation = { current: { pathname: '/foo' } }
    const history = []

    _middlewareAttemptChangeUrl(actionMetaLocation, history)

    expect(history).toEqual([])
  })

  it('when redirect calls history.replace(pathname)', () => {
    const { _middlewareAttemptChangeUrl } = setup('/')
    const actionMetaLocation = {
      kind: 'redirect',
      current: { pathname: '/foo' }
    }
    const replace = jest.fn()
    const history = { replace }

    _middlewareAttemptChangeUrl(actionMetaLocation, history)

    expect(replace).toBeCalledWith('/foo')
  })
})

describe('middleware -> _afterRouteChange()', () => {
  it('calls onBackNext handler when /pop|back|next/.test(kind)', () => {
    const dispatch = jest.fn(action => expect(action).toMatchSnapshot())
    const getState = jest.fn(() => ({
      location: {
        kind: 'pop'
      }
    }))
    const store = { dispatch, getState }
    const onBackNext = jest.fn(dispatch => dispatch({ type: 'FOO' }))
    const { _afterRouteChange } = setup('/', { onBackNext })

    _afterRouteChange(store, dispatch)

    const args = onBackNext.mock.calls[0]

    expect(dispatch).toHaveBeenCalled()
    expect(args[1]).toEqual(getState)
  })
})

describe('enhancer', () => {
  it('dispatches location-aware action when store is first created so app is location aware on load', () => {
    const { enhancer, reducer } = setup('/first')

    const createStore = reducer => ({
      // eslint-disable-line arrow-parens
      dispatch: jest.fn(),
      getState: () => reducer()
    })

    const rootReducer = (state = {}, action = {}) => ({
      location: reducer(state.location, action)
    })

    const store = enhancer(createStore)(rootReducer)
    const action = store.dispatch.mock.calls[0][0] /*? */

    expect(action).toMatchObject({
      type: 'FIRST',
      payload: {},
      meta: {
        location: {
          current: {
            type: 'FIRST',
            payload: {},
            pathname: '/first'
          },
          kind: 'load' // IMPORTANT: only dispatched on load
        }
      }
    })

    expect(action).toMatchSnapshot()
  })

  it("listens to history changes and dispatches actions matching history's location.pathname", () => {
    const { history, enhancer, reducer } = setup('/first')

    const createStore = reducer => ({
      dispatch: jest.fn(),
      getState: () => reducer()
    })

    const rootReducer = (state = {}, action = {}) => ({
      location: reducer(state.location, action)
    })

    const store = enhancer(createStore)(rootReducer)

    history.push('/second/bar')

    let action = store.dispatch.mock.calls[1][0] /*? */

    expect(action).toMatchObject({
      type: 'SECOND',
      payload: { param: 'bar' },
      meta: {
        location: {
          current: {
            type: 'SECOND',
            payload: { param: 'bar' },
            pathname: '/second/bar'
          },
          kind: 'push' // IMPORTANT: only dispatched when using browser back/forward buttons
        }
      }
    })

    expect(action).toMatchSnapshot()

    history.goBack()
    action = store.dispatch.mock.calls[2][0] /*? */

    expect(action.type).toEqual('FIRST')
    expect(action.meta.location.current.pathname).toEqual('/first')
  })

  it('throws when no location reducer provided', () => {
    const { enhancer, reducer } = setup('/first')

    const createStore = reducer => ({
      // eslint-disable-line arrow-parens
      dispatch: jest.fn(),
      getState: () => reducer()
    })

    const rootReducer = (state = {}, action = {}) => ({
      locationFOO: reducer(state.location, action)
    })

    const createEnhancer = () => enhancer(createStore)(rootReducer)
    expect(createEnhancer).toThrowError()
  })

  it('on the client correctly assigns routesMap to preloadedState so that functions in stringified server state are put back', () => {
    const { enhancer, reducer } = setup('/first')

    const createStore = reducer => ({
      // eslint-disable-line arrow-parens
      dispatch: jest.fn(),
      getState: () => reducer()
    })

    const rootReducer = (state = {}, action = {}) => ({
      location: reducer(state.location, action)
    })

    const preloadedState = { location: {} }
    enhancer(createStore)(rootReducer, preloadedState)

    expect(preloadedState.location.routesMap).toBeDefined()
  })
})

describe('enhancer -> _historyAttemptDispatchAction()', () => {
  it('dispatches action matching pathname when history location changes', () => {
    const dispatch = jest.fn()
    const store = { dispatch }
    const historyLocation = { pathname: '/second/foo' }
    const { _historyAttemptDispatchAction } = setup()

    _historyAttemptDispatchAction(store, historyLocation, 'pop')

    const action = dispatch.mock.calls[0][0] /*? */

    expect(action.type).toEqual('SECOND')
    expect(action.payload).toEqual({ param: 'foo' })
    expect(action.meta.location.kind).toEqual('pop')

    expect(action).toMatchSnapshot()
  })

  it('does not dispatch if pathname is the same (i.e. was handled by middleware already)', () => {
    const dispatch = jest.fn()
    const store = { dispatch }
    const historyLocation = { pathname: '/second/foo' }
    const { _historyAttemptDispatchAction } = setup()

    _historyAttemptDispatchAction(
      { dispatch: jest.fn() },
      historyLocation,
      'pop'
    )
    _historyAttemptDispatchAction(store, historyLocation, 'pop')

    // insure multiple dispatches are prevented for the same action/pathname
    // so that middleware and history listener don't double dispatch
    expect(dispatch.mock.calls).toEqual([])
  })
})

describe('thunk', () => {
  it('middleware:attemptCallRouteThunk DOES calls thunk if locationState.kind === "load" && !locationState.hasSSR', () => {
    const thunk = jest.fn()
    setupThunk('/second/bar', thunk)

    expect(thunk).toBeCalled()
  })

  it('middleware:attemptCallRouteThunk does NOT call thunk if locationState.kind === "load" && locationState.hasSSR', () => {
    const thunk = jest.fn()

    global.window.SSRtest = true
    setupThunk('/second/bar', thunk) /*? $.store.getState().location */
    delete global.window.SSRtest

    expect(thunk).not.toBeCalled()
  })

  it('middleware:attemptCallRouteThunk DOES call thunk if locationState.kind !== "load"', () => {
    const thunk = jest.fn()
    const { store } = setupThunk('/first', thunk)

    const action = { type: 'SECOND', payload: { param: 'bar' } }
    store.dispatch(action)

    store.getState() /*? */

    expect(thunk).toBeCalled()
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

    const { location } = store.getState() /*? $.location */

    // expect state matched that was dispatched in thunk
    expect(location.type).toEqual('THIRD')
    expect(location.pathname).toEqual('/third/hurray')
  })

  it('simulate server side manual usage of thunk via `await connectRoutes().thunk` (to be used when: locationState.kind === "load" && locationState.hasSSR)', async () => {
    const thunk = jest.fn(async (dispatch, getState) => {
      const action = { type: 'THIRD', payload: { param: 'hurray' } }
      dispatch(action)

      return Promise.resolve(getState()) // not really needed, but it's important we are testing what a thunk returning a promise looks like
    })

    global.window.SSRtest = true
    const { store, thunk: ssrThunk } = setupThunk('/second/bar', thunk)
    delete global.window.SSRtest

    // verify thunk has not been called yet
    const { location } = store.getState() /*? */
    expect(location.pathname).toEqual('/second/bar')

    // verify our manual calling of thunk via `await` has been called to simulate server side usage
    const state = await ssrThunk(store)

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
    expect(ret).not.toBeDefined()
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

  it('store.getState().location.kind === "redirect" after awaiting thunk', async () => {
    const thunk = jest.fn(dispatch => {
      const action = redirect({
        type: 'THIRD',
        payload: { param: 'hurray' }
      }) /*? */
      dispatch(action)
    })

    global.window.SSRtest = true
    const { store, history, thunk: ssrThunk } = setupThunk('/second/bar', thunk)
    delete global.window.SSRtest

    let { location } = store.getState() /*? */
    expect(location.pathname).toEqual('/second/bar')

    await ssrThunk(store)

    location = store.getState().location /*? */
    expect(location.kind).toEqual('redirect') // userland code would now call res.redirect(302, location.pathname) -- see server-rendering.md

    expect(history.length).toEqual(1) // if it wasn't a redirect, the length would be 2!
    expect(history.entries[0].pathname).toEqual('/third/hurray')
  })
})

describe('reducer', () => {
  it('reducer EXISTS and works (see __tests__/createLocationReducer for all its tests)', () => {
    const { reducer } = setup()
    const { action } = reducerParameters('SECOND', '/second/bar')

    const state = reducer(undefined, action)

    expect(state.pathname).toEqual('/second/bar')
  })
})

it('connectRoutes(undefined): throw error if no history provided', () => {
  expect(() => connectRoutes()).toThrowError()
})
