import { setupAll } from '../__test-helpers__/setup'
import tempMock from '../__test-helpers__/tempMock'

it('push: verify client-only `push` function calls `history.push()` using history from enclosed state', async () => {
  const { store, history } = await setupAll('/first')

  await history.push('/second/bar') // THIS IS THE TARGET OF THE TEST. Notice `push` is imported
  const { location } = store.getState()

  expect(location.type).toEqual('SECOND')
  expect(location.pathname).toEqual('/second/bar')

  expect(document.title).toEqual('SECOND')

  expect(history.length).toEqual(2)
})

it('replace: verify client-only `replace` function calls `history.redirect()` using history from enclosed state', async () => {
  const { store, history } = await setupAll('/first')

  await history.redirect('/second/bar')
  const { location } = store.getState()

  expect(location.type).toEqual('SECOND')
  expect(location.pathname).toEqual('/second/bar')

  expect(history.length).toEqual(1) // key difference between this test and previous `push` test
})

it('back: verify client-only `back` and `next` functions call `history.back/next()` using history from enclosed state', async () => {
  const { store, history } = await setupAll('/first')

  await history.push('/second/bar')
  let location = store.getState().location
  expect(location.type).toEqual('SECOND')
  expect(location.pathname).toEqual('/second/bar')

  await history.back() // THIS IS WHAT WE ARE VERIFYING
  location = store.getState().location
  expect(location.type).toEqual('FIRST')
  expect(location.pathname).toEqual('/first')

  await history.next() // THIS IS WHAT WE ARE VERIFYING
  location = store.getState().location
  expect(location.type).toEqual('SECOND')
  expect(location.pathname).toEqual('/second/bar')
})

it('verify window.document is not used server side', async () => {
  tempMock('../src/pure-utils/isServer', () => () => true)
  const { setupAll } = require('../__test-helpers__/setup')

  document.title = ''

  const { store } = await setupAll('/first')
  await store.dispatch({ type: 'SECOND', payload: { param: 'foo' } })

  expect(document.title).toEqual('')
})
