import { createMemoryHistory, createBrowserHistory } from 'rudy-history'
import nestAction, { nestHistory } from '../src/pure-utils/nestAction'

it('nestAction properly formats/nests action object', () => {
  const history = createMemoryHistory()
  const pathname = '/path'
  const receivedAction = {
    type: 'FOO',
    payload: { bar: 'baz' },
    meta: { info: 'something' }
  }
  const location = {
    pathname: 'previous',
    type: 'PREV',
    payload: { bla: 'prev' }
  }

  let action = nestAction(
    pathname,
    receivedAction,
    location,
    history
  ) /*? $.meta */

  expect(action.type).toEqual('FOO')
  expect(action.payload).toEqual({ bar: 'baz' })

  expect(action.type).toEqual(action.meta.location.current.type)
  expect(action.payload).toEqual(action.meta.location.current.payload)

  expect(action.meta.location.prev).toEqual(location)
  expect(action.meta).toMatchObject(receivedAction.meta)
  expect(action.meta.location.current.pathname).toEqual(pathname)

  expect(action).toMatchSnapshot()

  expect(action.meta.location.kind).not.toBeDefined()
  action = nestAction(pathname, receivedAction, location, history, 'load')
  expect(action.meta.location.kind).toEqual('load')

  action = nestAction(pathname, receivedAction, location, history, 'pop')
  expect(action.meta.location.kind).toEqual('pop')
})

it('nestHistory formats simplified history object for action + state', () => {
  const history = createMemoryHistory() // still use `createMemoryHistory` for stability during tests
  history.push('/foo')
  history.push('/bar/baz')

  const nestedHistory = nestHistory(history) /*? */
  expect(nestedHistory).toMatchSnapshot()
})

it('nestHistory returns undefined when using createBrowserHistory', () => {
  const history = createBrowserHistory()
  const nestedHistory = nestHistory(history)
  expect(nestedHistory).toEqual(undefined)
})
