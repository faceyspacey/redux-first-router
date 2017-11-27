import createSmartHistory from '../src/smart-history'
import { nestAction } from '../src/middleware/createRouteAction/utils'

it('nestAction properly formats/nests action object', () => {
  const pathname = '/path'
  const initialEntries = [pathname]
  const history = createSmartHistory({ initialEntries })
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
    receivedAction,
    location,
    history
  )

  expect(action.type).toEqual('FOO')
  expect(action.payload).toEqual({ bar: 'baz' })

  expect(action.location.prev).toEqual(location)
  expect(action).toMatchObject(receivedAction)
  expect(action.location.pathname).toEqual(pathname)

  expect(action).toMatchSnapshot()

  expect(action.location.kind).toEqual('load')

  history.kind = 'redirect'
  action = nestAction(receivedAction, location, history)
  expect(action.location.kind).toEqual('redirect')
})

