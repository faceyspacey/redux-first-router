import createSmartHistory from '../src/history'
import { nestAction } from '../src/middleware/transformAction/utils'

it('nestAction properly formats/nests action object', () => {
  const pathname = '/path'
  const initialEntries = [pathname]
  const history = createSmartHistory({ initialEntries })
  history.firstRoute.commit()

  const receivedAction = {
    type: 'FOO',
    params: { bar: 'baz' },
    meta: { info: 'something' }
  }
  const location = {
    pathname: 'previous',
    type: 'PREV',
    params: { bla: 'prev' }
  }

  // history.kind = 'load'

  let action = nestAction(
    receivedAction,
    location,
    history
  )

  expect(action.type).toEqual('FOO')
  expect(action.params).toEqual({ bar: 'baz' })

  expect(action.location.prev).toEqual(location)
  expect(action).toMatchObject(receivedAction)
  expect(action.location.pathname).toEqual(pathname)

  expect(action).toMatchSnapshot()

  expect(action.location.kind).toEqual('load')

  history.kind = 'redirect'
  action = nestAction(receivedAction, location, history)
  expect(action.location.kind).toEqual('redirect')
})

