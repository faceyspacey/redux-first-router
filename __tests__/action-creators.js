import { createMemoryHistory } from 'history'

import historyCreateAction from '../src/action-creators/historyCreateAction'
import middlewareCreateAction from '../src/action-creators/middlewareCreateAction'
import redirect from '../src/action-creators/redirect'
import { NOT_FOUND } from '../src/index'


it('historyCreateAction() - returns action created when history/address_bar chanages', () => {
  const history = createMemoryHistory()
  const pathname = '/info/foo'
  const prevLocation = { pathname: '/prev', type: 'PREV', payload: {} }
  const kind = 'backNext'
  const routesMap = {
    INFO: '/info',
    INFO_PARAM: '/info/:param',
  }

  const action = historyCreateAction(pathname, routesMap, prevLocation, history, kind)

  console.log(action)
  console.log(action.meta.location)

  expect(action).toMatchSnapshot()

  expect(action.type).toEqual('INFO_PARAM')
  expect(action.payload).toEqual({ param: 'foo' })

  expect(action.type).toEqual(action.meta.location.current.type)
  expect(action.payload).toEqual(action.meta.location.current.payload)

  expect(action.meta.location.prev).toEqual(prevLocation)
  expect(action.meta.location.current).toEqual({ pathname, type: 'INFO_PARAM', payload: { param: 'foo' } })

  expect(action.meta.location.backNext).toEqual(true)
  expect(action.meta.location.load).not.toBeDefined()
})


it('middlewareCreateAction() - returns action created when middleware detects connected/matched action.type', () => {
  const history = createMemoryHistory()
  const receivedAction = { type: 'INFO_PARAM', payload: { param: 'foo' } }
  const routesMap = {
    INFO: '/info',
    INFO_PARAM: '/info/:param',
  }
  const prevLocation = { pathname: '/prev', type: 'PREV', payload: {} }

  const action = middlewareCreateAction(receivedAction, routesMap, prevLocation, history)

  console.log(action)
  console.log(action.meta.location)

  expect(action.type).toEqual('INFO_PARAM')
  expect(action.payload).toEqual({ param: 'foo' })

  expect(action.type).toEqual(action.meta.location.current.type)
  expect(action.payload).toEqual(action.meta.location.current.payload)

  expect(action.meta.location.prev).toEqual(prevLocation)
  expect(action.meta.location.current).toEqual({ pathname: '/info/foo', type: 'INFO_PARAM', payload: { param: 'foo' } })

  expect(action.meta.location.load).not.toBeDefined()
  expect(action.meta.location.bakNext).not.toBeDefined()

  expect(action).toMatchSnapshot()
})


it('middlewareCreateAction() - [action not matched to any routePath]', () => {
  const history = createMemoryHistory()
  const receivedAction = { type: 'BLA', payload: { someKey: 'foo' } }
  const routesMap = {
    INFO: '/info',
    INFO_PARAM: '/info/:param',
  }
  const prevLocation = { pathname: '/prev', type: 'PREV', payload: {} }

  const action = middlewareCreateAction(receivedAction, routesMap, prevLocation, history)

  console.log(action)
  console.log(action.meta.location)

  expect(action.type).toEqual(NOT_FOUND)
  expect(action.payload).toEqual({ someKey: 'foo' })

  expect(action.meta.location.prev).toEqual(prevLocation)
  expect(action.meta.location.current.pathname).toEqual('/prev') // keep old pathname since no new pathname to push on to address bar

  expect(action).toMatchSnapshot()
})

it('redirect(action) - adds truthy redirect key to action.meta.location.redirect === \'true\'', () => {
  const receivedAction = { type: 'ANYTHING' }
  const action = redirect(receivedAction)

  console.log(action)
  expect(action.meta.location.redirect).toEqual('true')
})
