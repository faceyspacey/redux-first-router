import { createMemoryHistory, createBrowserHistory } from 'rudy-history'
import { nestAction } from '../src/middleware/createRouteAction'

it.skip('nestAction properly formats/nests action object', () => {
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

  // history.kind = 'load'

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

  history.kind = 'load'
  action = nestAction(pathname, receivedAction, location, history)
  expect(action.meta.location.kind).toEqual('load')
})

