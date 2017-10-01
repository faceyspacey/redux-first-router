import isLocationAction from '../src/pure-utils/isLocationAction'
import objectValues from '../src/pure-utils/objectValues'
import isServer from '../src/pure-utils/isServer'
import tempMock from '../__test-helpers__/tempMock'

it('isLocationAction(action) if has meta.location object', () => {
  let ret = isLocationAction({})
  expect(ret).toBeFalsy()

  ret = isLocationAction({ meta: { location: { current: {} } } })
  expect(ret).toBeTruthy()
})

it('objectValues(routesMap) converts map of routes to an array of routes without the action type keys', () => {
  const routesMap = {
    ACTION_TYPE: '/foo/:bar',
    ACTION_TYPE_2: { path: '/path/:baz/', capitalizedWords: true }
  }

  const ret = objectValues(routesMap)
  expect(ret).toEqual([routesMap.ACTION_TYPE, routesMap.ACTION_TYPE_2])
})

it('isServer()', () => {
  expect(isServer()).toEqual(false)
})

it('isServer(): mocked', () => {
  tempMock('../src/pure-utils/isServer', () => ({ default: () => true }))

  const isServer = require('../src/pure-utils/isServer').default
  expect(isServer()).toEqual(true)
})
