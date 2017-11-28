import { setupAll } from '../__test-helpers__/setup'
import createHistory from '../src/history'

it('basename: memoryHistory can prefix paths with a basename', async () => {
  const { store, history } = await setupAll('/base-foo/first', {
    basename: '/base-foo'
  })
  expect(history.location.pathname).toEqual('/first')

  await store.dispatch({ type: 'THIRD' })
  expect(history.location.pathname).toEqual('/third')
})

it('options.createHistory', async () => {
  const { store, history } = await setupAll('/first', { createHistory })
  expect(history.location.pathname).toEqual('/first')

  await store.dispatch({ type: 'THIRD' })
  expect(history.location.pathname).toEqual('/third')
})
