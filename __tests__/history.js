import { createMemoryHistory } from 'rudy-history'
import { setupAll } from '../__test-helpers__/setup'

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
