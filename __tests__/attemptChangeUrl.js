import { createMemoryHistory } from 'rudy-history'
import setup, { setupAll } from '../__test-helpers__/setup'

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
