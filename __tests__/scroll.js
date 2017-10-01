import { setupAll } from '../__test-helpers__/setup'

it('scrolls to top on route change when options.scrollTop === true', () => {
  const scrollTo = jest.fn()
  window.scrollTo = scrollTo
  const { store } = setupAll('/first', { scrollTop: true })

  jest.useFakeTimers()
  store.dispatch({ type: 'SECOND', payload: { param: 'bar' } })
  jest.runAllTimers()

  expect(scrollTo).toHaveBeenCalled()
})
