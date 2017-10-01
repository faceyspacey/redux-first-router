import { setupAll } from '../__test-helpers__/setup'
import { push, replace, back, next } from '../src/connectRoutes'
import tempMock from '../__test-helpers__/tempMock'

it('push: verify client-only `push` function calls `history.push()` using history from enclosed state', () => {
  jest.useFakeTimers()
  const { store, history } = setupAll('/first')

  push('/second/bar') // THIS IS THE TARGET OF THE TEST. Notice `push` is imported
  const { location } = store.getState()

  expect(location.type).toEqual('SECOND')
  expect(location.pathname).toEqual('/second/bar')

  jest.runAllTimers() // title set in next tick
  expect(document.title).toEqual('SECOND')

  expect(history.length).toEqual(2)
})

it('replace: verify client-only `replace` function calls `history.replace()` using history from enclosed state', () => {
  const { store, history } = setupAll('/first')

  replace('/second/bar')
  const { location } = store.getState()

  expect(location.type).toEqual('SECOND')
  expect(location.pathname).toEqual('/second/bar')

  expect(history.length).toEqual(1) // key difference between this test and previous `push` test
})

it('back: verify client-only `back` and `next` functions call `history.goBack/goForward()` using history from enclosed state', () => {
  const { store, history } = setupAll('/first')

  history.push('/second/bar')
  let location = store.getState().location
  expect(location.type).toEqual('SECOND')
  expect(location.pathname).toEqual('/second/bar')

  back() // THIS IS WHAT WE ARE VERIFYING
  location = store.getState().location
  expect(location.type).toEqual('FIRST')
  expect(location.pathname).toEqual('/first')

  next() // THIS IS WHAT WE ARE VERIFYING
  location = store.getState().location
  expect(location.type).toEqual('SECOND')
  expect(location.pathname).toEqual('/second/bar')
})

it('verify window.document is not used server side', () => {
  tempMock('../src/pure-utils/isServer', () => () => true)
  const { setupAll } = require('../__test-helpers__/setup')

  jest.useFakeTimers()
  document.title = ''

  const { store } = setupAll('/first')
  store.dispatch({ type: 'SECOND', payload: { param: 'foo' } })

  jest.runAllTimers() // title set in next tick
  expect(document.title).toEqual('')
})
