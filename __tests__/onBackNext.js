import { setupAll } from '../__test-helpers__/setup'

it('afterRouteChange: calls onBackNext handler when /pop|back|next/.test(kind)', () => {
  const onBackNext = jest.fn(dispatch => dispatch({ type: 'THIRD' }))
  const { store, history } = setupAll('/first', { onBackNext })

  history.push('/second/foo')
  history.goBack()

  expect(onBackNext).toHaveBeenCalled()
  expect(store.getState().location.type).toEqual('THIRD')
})
