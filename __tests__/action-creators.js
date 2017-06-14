import { createMemoryHistory } from 'history'

import historyCreateAction from '../src/action-creators/historyCreateAction'
import middlewareCreateAction
  from '../src/action-creators/middlewareCreateAction'
import redirect from '../src/action-creators/redirect'
import { NOT_FOUND } from '../src/index'

it('historyCreateAction() - returns action created when history/address_bar chanages', () => {
  const history = createMemoryHistory()
  const pathname = '/info/foo'
  const prevLocation = { pathname: '/prev', type: 'PREV', payload: {} }
  const kind = 'pop'
  const routesMap = {
    INFO: '/info',
    INFO_PARAM: '/info/:param'
  }

  const action = historyCreateAction(
    pathname,
    routesMap,
    prevLocation,
    history,
    kind
  ) /*? $.meta.location */

  expect(action).toMatchSnapshot()

  expect(action.type).toEqual('INFO_PARAM')
  expect(action.payload).toEqual({ param: 'foo' })

  expect(action.type).toEqual(action.meta.location.current.type)
  expect(action.payload).toEqual(action.meta.location.current.payload)

  expect(action.meta.location.prev).toEqual(prevLocation)
  expect(action.meta.location.current).toEqual({
    pathname,
    type: 'INFO_PARAM',
    payload: { param: 'foo' }
  })

  expect(action.meta.location.kind).toEqual('pop')
})

it('middlewareCreateAction() - returns action created when middleware detects connected/matched action.type', () => {
  const history = createMemoryHistory()
  const receivedAction = { type: 'INFO_PARAM', payload: { param: 'foo' } }
  const routesMap = {
    INFO: '/info',
    INFO_PARAM: '/info/:param'
  }
  const prevLocation = { pathname: '/prev', type: 'PREV', payload: {} }

  const action = middlewareCreateAction(
    receivedAction,
    routesMap,
    prevLocation,
    history
  ) /*? $.meta.location */

  expect(action.type).toEqual('INFO_PARAM')
  expect(action.payload).toEqual({ param: 'foo' })

  expect(action.type).toEqual(action.meta.location.current.type)
  expect(action.payload).toEqual(action.meta.location.current.payload)

  expect(action.meta.location.prev).toEqual(prevLocation)
  expect(action.meta.location.current).toEqual({
    pathname: '/info/foo',
    type: 'INFO_PARAM',
    payload: { param: 'foo' }
  })

  expect(action.meta.location.kind).toEqual('push')

  expect(action).toMatchSnapshot()
})

it('middlewareCreateAction() - [action not matched to any routePath]', () => {
  const history = createMemoryHistory()
  const receivedAction = { type: 'BLA', payload: { someKey: 'foo' } }
  const routesMap = {
    INFO: '/info',
    INFO_PARAM: '/info/:param'
  }
  const prevLocation = { pathname: '/prev', type: 'PREV', payload: {} }

  const action = middlewareCreateAction(
    receivedAction,
    routesMap,
    prevLocation,
    history,
    '/not-found'
  ) /*? $.meta.location */

  expect(action.type).toEqual(NOT_FOUND)
  expect(action.payload).toEqual({ someKey: 'foo' })

  expect(action.meta.location.prev).toEqual(prevLocation)
  expect(action.meta.location.current.pathname).toEqual('/not-found')

  expect(action).toMatchSnapshot()
})

it('redirect(action) - sets action.meta.location.kind === "redirect"', () => {
  const receivedAction = { type: 'ANYTHING' }
  const action = redirect(receivedAction) /*? */

  expect(action.meta.location.kind).toEqual('redirect')
})
