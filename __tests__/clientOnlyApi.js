import { createStore, applyMiddleware } from 'redux'

import setup from '../__test-helpers__/setup'
import { push, back, next } from '../src/connectRoutes'


it('push: verify client-only `push` function calls `history.push()` using history from enclosed state', () => {
  const { enhancer, reducer } = setup('/first')

  const createStore = (reducer /* , initialState, enhancer */) => ({ // eslint-disable-line arrow-parens
    dispatch: jest.fn(),
    getState: () => reducer(),
  })

  const rootReducer = (state = {}, action = {}) => ({
    location: reducer(state.location, action),
  })

  const store = enhancer(createStore)(rootReducer)

  push('/second/bar')
  const action = store.dispatch.mock.calls[1][0]

  console.log(action)
  expect(action.type).toEqual('SECOND')
  expect(action.meta.location.current.pathname).toEqual('/second/bar')
})


it('back: verify client-only `back` and `next` functions call `history.goBack/goForward()` using history from enclosed state', () => {
  const { history, enhancer, reducer } = setup('/first')

  const createStore = (reducer /* , initialState, enhancer */) => ({ // eslint-disable-line arrow-parens
    dispatch: jest.fn(),
    getState: () => reducer(),
  })

  const rootReducer = (state = {}, action = {}) => ({
    location: reducer(state.location, action),
  })

  const store = enhancer(createStore)(rootReducer)

  history.push('/second/bar')
  let action = store.dispatch.mock.calls[1][0]

  console.log(action)
  expect(action.type).toEqual('SECOND')
  expect(action.meta.location.current.pathname).toEqual('/second/bar')

  back() // THIS IS WHAT WE ARE VERIFYING
  action = store.dispatch.mock.calls[2][0]

  console.log(action)
  expect(action.type).toEqual('FIRST')
  expect(action.meta.location.current.pathname).toEqual('/first')

  next() // THIS IS WHAT WE ARE VERIFYING
  action = store.dispatch.mock.calls[3][0]

  console.log(action)
  expect(action.type).toEqual('SECOND')
  expect(action.meta.location.current.pathname).toEqual('/second/bar')
})


it('verify window.document is not used server side', () => {
  window.isSSR = true

  const { middleware, windowDocument, reducer: locationReducer } = setup()
  const middlewares = applyMiddleware(middleware)

  const reducer = (state = {}, action = {}) => ({
    location: locationReducer(state.location, action),
    title: `title: ${action.type}`,
  })

  const store = createStore(reducer, undefined, middlewares)

  store.dispatch({ type: 'FIRST' })

  console.log(windowDocument.title)
  console.log(document.title)

  expect(windowDocument.title).toEqual('title: FIRST') // fake document object used instead
  expect(document.title).toEqual('')

  delete CONFIG.isSSR
})
