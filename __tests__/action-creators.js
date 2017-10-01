import { createMemoryHistory } from 'rudy-history'

import historyCreateAction from '../src/action-creators/historyCreateAction'
import middlewareCreate from '../src/action-creators/middlewareCreateAction'
import redirect from '../src/action-creators/redirect'
import addRoutes from '../src/action-creators/addRoutes'
import { NOT_FOUND } from '../src/index'

import { setupAll } from '../__test-helpers__/setup'

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
  console.log(action)
  expect(action).toMatchSnapshot()

  expect(action.type).toEqual('INFO_PARAM')
  expect(action.payload).toEqual({ param: 'foo' })

  expect(action.type).toEqual(action.meta.location.current.type)
  expect(action.payload).toEqual(action.meta.location.current.payload)

  expect(action.meta.location.prev).toEqual(prevLocation)
  expect(action.meta.location.current).toEqual({
    pathname,
    type: 'INFO_PARAM',
    payload: { param: 'foo' },
    kind: 'pop'
  })

  expect(action.meta.location.kind).toEqual('pop')
})

it('middlewareCreate() - returns action created when middleware detects connected/matched action.type', () => {
  const history = createMemoryHistory()
  const receivedAction = { type: 'INFO_PARAM', payload: { param: 'foo' } }
  const routesMap = {
    INFO: '/info',
    INFO_PARAM: '/info/:param'
  }
  const prevLocation = { pathname: '/prev', type: 'PREV', payload: {} }

  const action = middlewareCreate(
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
    payload: { param: 'foo' },
    kind: 'push'
  })

  expect(action.meta.location.kind).toEqual('push')

  expect(action).toMatchSnapshot()
})

it('middlewareCreate() - [action not matched to any routePath]', () => {
  const history = createMemoryHistory()
  const receivedAction = { type: 'BLA', payload: { someKey: 'foo' } }
  const routesMap = {
    INFO: '/info',
    INFO_PARAM: '/info/:param'
  }
  const prevLocation = { pathname: '/prev', type: 'PREV', payload: {} }

  const action = middlewareCreate(
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

it('addRoutes(routes) - adds routes to routesMap', () => {
  const newRoutes = {
    FOO: '/foo',
    BAR: { path: '/bar' }
  }

  const { store } = setupAll()

  const thunk = addRoutes(newRoutes)
  store.dispatch(thunk)
  expect(store.getState()).toMatchSnapshot()

  store.dispatch({ type: 'FOO' })
  expect(store.getState().location.type).toEqual('FOO')
})
