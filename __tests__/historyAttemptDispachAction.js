import setup, { setupAll } from '../__test-helpers__/setup'

it('historyAttemptDispatchAction: dispatches action matching pathname when history location changes', () => {
  const dispatch = jest.fn()
  const store = { dispatch }
  const historyLocation = { pathname: '/second/foo' }
  const { _historyAttemptDispatchAction } = setup()

  _historyAttemptDispatchAction(store, historyLocation, 'pop')

  const action = dispatch.mock.calls[0][0] /*? */

  expect(action.type).toEqual('SECOND')
  expect(action.payload).toEqual({ param: 'foo' })
  expect(action.meta.location.kind).toEqual('pop')

  expect(action).toMatchSnapshot()
})

it('historyAttemptDispatchAction: does not dispatch if pathname is the same (i.e. was handled by middleware already)', () => {
  const dispatch = jest.fn()
  const store = { dispatch }
  const historyLocation = { pathname: '/second/foo' }
  const { _historyAttemptDispatchAction } = setup()

  _historyAttemptDispatchAction({ dispatch: jest.fn() }, historyLocation, 'pop')
  _historyAttemptDispatchAction(store, historyLocation, 'pop')

  // insure multiple dispatches are prevented for the same action/pathname
  // so that middleware and history listener don't double dispatch
  expect(dispatch.mock.calls).toEqual([])
})
