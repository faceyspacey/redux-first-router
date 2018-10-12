import { createMemoryHistory } from 'rudy-history'
import querySerializer from 'query-string'

import setup, { setupAll } from '../__test-helpers__/setup'
import setupThunk from '../__test-helpers__/setupThunk'
import reducerParameters from '../__test-helpers__/reducerParameters'

import { NOT_FOUND } from '../src/index'
import redirect from '../src/action-creators/redirect'
import pathToAction from '../src/pure-utils/pathToAction'

beforeEach(() => {
  window.SSRtest = false
})

describe('middleware', () => {
  it('dispatches location-aware action, changes address bar + document.title', () => {
    const { store, history } = setupAll()

    expect(document.title).toEqual('')
    expect(history.location.pathname).toEqual('/')
    expect(store.getState().location).toMatchSnapshot()

    const payload = { param: 'bar' }
    const action = store.dispatch({ type: 'SECOND', payload }) /*? $.meta */

    store.getState() /*? */

    expect(history.location.pathname).toEqual('/second/bar')
    expect(action).toMatchSnapshot()
    expect(store.getState()).toMatchSnapshot()
  })

  it('not matched received action dispatches the action as normal with no changes', () => {
    const { store, history } = setupAll('/first')

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
    const { store } = setupAll('/first')
    const action = store.dispatch({ type: NOT_FOUND }) /*? $.meta */

    store.getState() /*? $.location */

    expect(action).toMatchSnapshot()
  })

  it('user dispatches NOT_FOUND redirect and middleware adds missing info to action', () => {
    const { store } = setupAll('/first')
    const action = store.dispatch(redirect({ type: NOT_FOUND })) /*? $.meta */

    store.getState() /*? $.location */

    expect(action).toMatchSnapshot()
  })

  it('does nothing if action has error', () => {
    const { store } = setupAll('/first')

    const receivedAction = {
      error: true,
      type: 'SECOND',
      meta: { location: { current: {} } }
    }

    store.dispatch(receivedAction) /*? */
    expect(store.getState().location.type).toEqual('FIRST')
  })

  it('calls onBeforeChange handler on route change', () => {
    const onBeforeChange = jest.fn()
    const { store } = setupAll('/first', { onBeforeChange })

    const action = { type: 'SECOND', payload: { param: 'bar' } }
    store.dispatch(action)

    expect(onBeforeChange).toHaveBeenCalled()
    expect(onBeforeChange.mock.calls[1][2].action).toMatchObject(action)
    expect(onBeforeChange.mock.calls[1][2].extra).toEqual('extra-arg')
  })

  it('if onBeforeChange dispatches redirect, route changes with kind === "redirect"', () => {
    const onBeforeChange = jest.fn((dispatch, getState, { action }) => {
      if (action.type !== 'SECOND') return
      const act = redirect({ type: 'THIRD' })
      dispatch(act)
    })

    const { store, history } = setupAll('/first', { onBeforeChange })
    store.dispatch({ type: 'SECOND', payload: { param: 'bar' } })
    const { location } = store.getState()

    expect(location.kind).toEqual('redirect')
    expect(location.type).toEqual('THIRD')
    expect(history.entries.length).toEqual(2)
    expect(location).toMatchSnapshot()
    expect(onBeforeChange).toHaveBeenCalled()
  })

  it('onBeforeChange redirect on server results in 1 history entry', () => {
    window.SSRtest = true

    const onBeforeChange = jest.fn((dispatch, getState, { action }) => {
      if (action.type !== 'SECOND') return
      const act = redirect({ type: 'THIRD' })
      dispatch(act)
    })
    const { store, history } = setupAll('/first', {
      onBeforeChange
    })

    store.dispatch({ type: 'SECOND', payload: { param: 'bar' } })

    const { location } = store.getState()
    expect(history.entries.length).toEqual(1) // what we are testing for
    expect(location).toMatchSnapshot()

    window.SSRtest = false
  })

  it('calls onAfterChange handler on route change', () => {
    const onAfterChange = jest.fn()
    const { store } = setupAll('/first', { onAfterChange })

    const action = { type: 'SECOND', payload: { param: 'bar' } }
    store.dispatch(action)
    expect(onAfterChange).toHaveBeenCalled()
    expect(onAfterChange.mock.calls[0][1]()).toEqual(store.getState())
    expect(onAfterChange.mock.calls[1][2].action).toMatchObject(action)
    expect(onAfterChange.mock.calls[1][2].extra).toEqual('extra-arg')
  })

  it('skips onAfterChange on redirect', () => {
    const redirectAction = { type: 'THIRD', payload: { param: 'bar' } }
    const thunk = jest.fn(dispatch => {
      const action = redirect({ ...redirectAction })
      dispatch(action)
    })
    const onAfterChange = jest.fn()

    const { store } = setupThunk('/first', thunk, { onAfterChange })
    store.dispatch({ type: 'SECOND', payload: { param: 'bar' } })

    const { location } = store.getState()
    expect(location).toMatchObject(redirectAction)
    expect(onAfterChange).toHaveBeenCalled()
    expect(onAfterChange.mock.calls.length).toEqual(2) // would otherwise be called 3x if onAfterChange from SECOND route was not skipped
  })

  it('scrolls to top on route change when options.scrollTop === true', () => {
    const scrollTo = jest.fn()
    window.scrollTo = scrollTo
    const { store } = setupAll('/first', { scrollTop: true })

    jest.useFakeTimers()
    store.dispatch({ type: 'SECOND', payload: { param: 'bar' } })
    jest.runAllTimers()

    expect(scrollTo).toHaveBeenCalled()
  })
})

describe('middleware -> _middlewareAttemptChangeUrl()', () => {
  it('when pathname changes push new pathname on to addressbar', () => {
    const { _middlewareAttemptChangeUrl } = setup()
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
    const onBackNext = jest.fn(dispatch => dispatch({ type: 'THIRD' }))
    const { store, history } = setupAll('/first', { onBackNext })

    history.push('/second/foo')
    history.goBack()

    expect(onBackNext).toHaveBeenCalled()
    expect(store.getState().location.type).toEqual('THIRD')
  })
})

describe('enhancer', () => {
  it('dispatches location-aware action when store is first created so app is location aware on load', () => {
    const { store } = setupAll('/first')
    const location = store.getState().location

    expect(location).toMatchObject({
      type: 'FIRST',
      payload: {},
      kind: 'load' // IMPORTANT: only dispatched on load
    })
  })

  it("listens to history changes and dispatches actions matching history's location.pathname", () => {
    const { store, history } = setupAll('/first')

    history.push('/second/bar')
    const location1 = store.getState().location

    expect(location1).toMatchObject({
      type: 'SECOND',
      pathname: '/second/bar',
      payload: { param: 'bar' },
      kind: 'push' // IMPORTANT: only dispatched when using browser back/forward buttons
    })

    history.goBack()
    const location2 = store.getState().location

    expect(location2.type).toEqual('FIRST')
    expect(location2.pathname).toEqual('/first')
  })

  it('throws when no location reducer provided', () => {
    const rootReducer = (state = {}, action = {}) => ({
      locationFOO: 'bar'
    })

    const createEnhancer = () => setupAll('/first', undefined, { rootReducer })
    expect(createEnhancer).toThrowError()
  })

  it('on the client correctly assigns routesMap to preloadedState so that functions in stringified server state are put back', () => {
    const preLoadedState = { location: { pathname: '/' } }
    const { store } = setupAll('/first', undefined, { preLoadedState })

    expect(store.getState().location.routesMap).toBeDefined()
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
    expect(thunk).toHaveBeenCalled()
    expect(thunk.mock.calls[0].length).toEqual(3)
    expect(thunk.mock.calls[0][2].action).toMatchObject(action)
    expect(thunk.mock.calls[0][2].extra).toEqual('extra-arg')
  })

  it('pathless route calls attemptCallRouteThunk', () => {
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

it('title and location options as selector functions', () => {
  const { store } = setupAll('/first', {
    title: state => state.title,
    location: state => state.location
  })

  const action = store.dispatch({ type: 'FIRST' }) /*? $.meta */

  store.getState() /*? $.location */

  expect(action).toMatchSnapshot()
})

it('QUERY: has initial query in state during initial onBeforeChange event', () => {
  let query = null
  const onBeforeChange = jest.fn(
    (_, getState) => query = getState().location.query
  )
  setupAll('/first?param=something', { querySerializer, onBeforeChange })

  expect(onBeforeChange).toHaveBeenCalledTimes(1)
  expect(query).toEqual({ param: 'something' })
})

it('QUERY: dispatched as action.query', () => {
  const { store } = setupAll('/third', { querySerializer })
  const query = { foo: 'bar', baz: 69 }

  store.dispatch({ type: 'FIRST', query })
  store.dispatch({ type: 'THIRD', query })

  const state = store.getState() /*? $.location */
  expect(state).toMatchSnapshot()
})

it('QUERY: dispatched as action.meta.query', () => {
  const { store } = setupAll('/third', { querySerializer })
  const query = { foo: 'bar', baz: 69 }

  store.dispatch({ type: 'FIRST', meta: { query } })
  store.dispatch({ type: 'THIRD', meta: { query } })

  const state = store.getState() /*? $.location */
  expect(state).toMatchSnapshot()
})

it('QUERY: dispatched as action.payload.query', () => {
  const { store } = setupAll('/third', { querySerializer })
  const payload = { foo: 'bar', baz: 69 }

  store.dispatch({ type: 'FIRST', meta: { payload } })
  store.dispatch({ type: 'THIRD', meta: { payload } })

  const state = store.getState() /*? $.location */
  expect(state).toMatchSnapshot()
})

it('QUERY: history.push("/path?search=foo")', () => {
  const { store, history } = setupAll('/third', { querySerializer })

  history.push('/first?foo=bar&baz=69')
  history.push('/third?foo=bar&baz=69')

  const state = store.getState() /*? $.location */
  expect(state).toMatchSnapshot()
})

it('QUERY: currentPathName changes, but pathname stays the same (only query changes)', () => {
  const { store, history } = setupAll('/third', { querySerializer })

  history.push('/first?foo=bar&baz=69')
  history.push('/first?foo=car&baz=70')

  const state = store.getState() /*? $.location */
  expect(state).toMatchSnapshot()
})

it('QUERY: generated from pathToAction within <Link />', () => {
  const { store, history, routesMap } = setupAll('/third', { querySerializer })

  let action = pathToAction(
    '/first?foo=bar&baz=69',
    routesMap,
    querySerializer
  ) /*? */
  store.dispatch(action)

  action = pathToAction(
    '/first?foo=car&baz=70',
    routesMap,
    querySerializer
  ) /*? */
  store.dispatch(action)

  const state = store.getState() /*? $.location */
  expect(state).toMatchSnapshot()
})

it('basename: memoryHistory can prefix paths with a basename', () => {
  const { store, history } = setupAll('/base-foo/first', {
    basename: '/base-foo'
  })
  expect(history.location.pathname).toEqual('/first')

  store.dispatch({ type: 'THIRD' })
  expect(history.location.pathname).toEqual('/third')
})

it('options.createHistory', () => {
  const { store, history } = setupAll('/first', {
    createHistory: createMemoryHistory
  })
  expect(history.location.pathname).toEqual('/first')

  store.dispatch({ type: 'THIRD' })
  expect(history.location.pathname).toEqual('/third')
})
