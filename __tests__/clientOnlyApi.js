import { createStore, applyMiddleware } from 'redux'

import setup from '../__test-helpers__/setup'
import { go, back } from '../src/connectTypes'


it('go: verify client-only `go` function returns location-aware action using enclosed state', () => {
  const { _exportedGo } = setup()
  const action = go('/second/bar')

  console.log(action)

  expect(action).toEqual({ type: 'SECOND', payload: { param: 'bar' } })
  expect(action).toEqual(_exportedGo('/second/bar'))
})


it('back: verify client-only `back` function calls `history.goBack()` using history from enclosed state', () => {
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
  expect(action.type).toEqual('SECOND')
  expect(action.meta.location.current.pathname).toEqual('/second/bar')

  back() // THIS IS WHAT WE ARE VERIFYING
  action = store.dispatch.mock.calls[2][0]

  console.log(action)
  expect(action.type).toEqual('FIRST')
  expect(action.meta.location.current.pathname).toEqual('/first')
})


it('verify window.document is not used server side', () => {
  CONFIG.isSSR = true

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

  CONFIG.isSSR = false
})
