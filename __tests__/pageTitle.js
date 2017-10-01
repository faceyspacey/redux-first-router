import { setupAll } from '../__test-helpers__/setup'
import changePageTitle from '../src/pure-utils/changePageTitle'

it('title and location options as selector functions', () => {
  const { store } = setupAll('/first', {
    title: state => state.title,
    location: state => state.location
  })

  const action = store.dispatch({ type: 'FIRST' }) /*? $.meta */

  store.getState() /*? $.location */

  expect(action).toMatchSnapshot()
})

it('unit: when title changes set it to document.title', () => {
  const document = {}
  const title = 'foo'

  const ret = changePageTitle(document, title)

  expect(document).toEqual({ title: 'foo' })
  expect(ret).toEqual('foo')
})

it('unit: hen title changes do not set document.title', () => {
  const document = { title: 'foo' }
  const title = 'foo'

  const ret = changePageTitle(document, title)

  expect(document).toEqual({ title: 'foo' })
  expect(ret).toEqual(null) // no return value when title does not change
})
