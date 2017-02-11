import isLocationAction from '../src/pure-utils/isLocationAction'
import objectValues from '../src/pure-utils/objectValues'
import nestAction from '../src/pure-utils/nestAction'
import pathToAction from '../src/pure-utils/pathToAction'
import actionToPath from '../src/pure-utils/actionToPath'
import changePageTitle from '../src/pure-utils/changePageTitle'

import { NOT_FOUND } from '../src/actions'


it('isLocationAction(action) if has meta.location object', () => {
  let ret = isLocationAction({})
  expect(ret).toBeFalsy()

  ret = isLocationAction({ meta: { location: { } } })
  expect(ret).toBeTruthy()
})


it('objectValues(routes) converts dictionary of routes to an array of routes without the action type keys', () => {
  const routes = {
    ACTION_TYPE: '/foo/:bar',
    ACTION_TYPE_2: { path: '/path/:baz/', capitalizedWords: true },
  }

  const ret = objectValues(routes)
  expect(ret).toEqual([routes.ACTION_TYPE, routes.ACTION_TYPE_2])
  console.log(ret)
})


it('nestAction(pathname, action, location)', () => {
  const pathname = 'path'
  const receivedAction = { type: 'FOO', payload: { bar: 'baz' }, meta: { info: 'something' } }
  const location = { pathname: 'previous', type: 'PREV', payload: { bla: 'prev' } }
  let action = nestAction(pathname, receivedAction, location)

  expect(action).toMatchSnapshot()

  expect(action.type).toEqual('FOO')
  expect(action.payload).toEqual({ bar: 'baz' })

  expect(action.type).toEqual(action.meta.location.current.type)
  expect(action.payload).toEqual(action.meta.location.current.payload)

  expect(action.meta.location.prev).toEqual(location)
  expect(action.meta).toMatchObject(receivedAction.meta)
  expect(action.meta.location.current.pathname).toEqual(pathname)

  console.log(action)
  console.log(action.meta.location)

  expect(action.meta.location.load).not.toBeDefined()
  action = nestAction(pathname, receivedAction, location, 'load')
  expect(action.meta.location.load).toEqual(true)
})


describe('pathToAction(path, routes, routeNames)', () => {
  it('parse path into action using routePath without /:param segment', () => {
    const routesMap = {
      INFO: '/info',
      INFO_PARAM: '/info/:param',
    }

    const action = pathToAction('/info', routesMap)
    expect(action).toEqual({ type: 'INFO', payload: {} })
    console.log(action)
  })

  it('parse path into action using routePath with /:param segment', () => {
    const routesMap = {
      INFO: '/info',
      INFO_PARAM: '/info/:param',
    }

    const action = pathToAction('/info/foo', routesMap)
    expect(action).toEqual({ type: 'INFO_PARAM', payload: { param: 'foo' } })
    console.log(action)
  })

  it('parse path (/info/foo-bar) into action using route object containing capitalizedWords: true: payload: { param: "Foo Bar" }', () => {
    const path = '/info/foo-bar'
    const routes = [{ path: '/info/:param/', capitalizedWords: true }]
    const routeNames = ['INFO']

    const action = pathToAction(path, routes, routeNames)
    expect(action.payload.param).toEqual('Foo Bar')
    console.log(action)
  })

  it('parse path into action using route object containing fromPath() function', () => {
    const path = '/info/foo-bar'
    const routes = [{ path: '/info/:param/', fromPath: (segment, key) => (`${segment} ${key}`).replace('-', ' ').toUpperCase() }]
    const routeNames = ['INFO']

    const action = pathToAction(path, routes, routeNames)
    expect(action.payload.param).toEqual('FOO BAR PARAM')
    console.log(action)
  })

  it('parse path containing number param into action with payload value set as integer instead of string', () => {
    const path = '/info/69'
    const routes = ['/info/:param/']
    const routeNames = ['INFO']

    const action = pathToAction(path, routes, routeNames)
    expect(typeof action.payload.param).toEqual('number')
    expect(action.payload.param).toEqual(69)
    console.log(action)
  })

  it('parsed path not found and return NOT_FOUND action.type: "@@pure-redux-router/NOT_FOUND"', () => {
    const path = '/info/foo/bar'
    const routes = ['/info/:param/']
    const routeNames = ['INFO']

    const action = pathToAction(path, routes, routeNames)
    expect(action.type).toEqual(NOT_FOUND)
    console.log(action)
  })
})


describe('actionToPath(action, routesMap)', () => {
  it('parse action into path without payload: /info', () => {
    const action = { type: 'INFO' }
    const routesMap = {
      INFO: '/info',
      INFO_PARAM: '/info/:param',
    }

    const path = actionToPath(action, routesMap)
    expect(path).toEqual('/info')
    console.log(path)
  })

  it('parse action payload into path segment: /info/foo', () => {
    const action = { type: 'INFO_PARAM', payload: { param: 'foo' } }
    const routesMap = {
      INFO: '/info',
      INFO_PARAM: '/info/:param',
    }

    const path = actionToPath(action, routesMap)
    expect(path).toEqual('/info/foo')
    console.log(path)
  })

  it('parse action into path with numerical payload key value: /info/69', () => {
    const action = { type: 'INFO_PARAM', payload: { param: 69 } }
    const routesMap = {
      INFO: '/info',
      INFO_PARAM: { path: '/info/:param', capitalizedWords: true },
    }

    const path = actionToPath(action, routesMap)
    expect(path).toEqual('/info/69')
    console.log(path)
  })

  it('parse action into path with parameters using route object containing capitalizedWords: true: /info/foo-bar', () => {
    const action = { type: 'INFO_PARAM', payload: { param: 'Foo Bar' } }
    const routesMap = {
      INFO_PARAM: { path: '/info/:param', capitalizedWords: true },
    }

    const path = actionToPath(action, routesMap)
    expect(path).toEqual('/info/foo-bar')
    console.log(path)
  })

  it('parse action into path with parameters using route object containing toPath() function: /info/foo-param-bar', () => {
    const action = { type: 'INFO_PARAM', payload: { param: 'Foo Bar' } }
    const routesMap = {
      INFO_PARAM: { path: '/info/:param', toPath: (value, key) => value.replace(' ', `-${key}-`).toLowerCase() },
    }

    const path = actionToPath(action, routesMap)
    expect(path).toEqual('/info/foo-param-bar')
    console.log(path)
  })

  it('perform no formatting when route object contains ONLY path key: /info/FooBar', () => {
    const action = { type: 'INFO_PARAM', payload: { param: 'FooBar' } }
    const routesMap = {
      INFO_PARAM: { path: '/info/:param' },
    }

    const path = actionToPath(action, routesMap)
    expect(path).toEqual('/info/FooBar')
    console.log(path)
  })

  it('throw error when parsing non-matched action', () => {
    const routesMap = {
      INFO: { path: '/info' },
    }

    let performMatch = () => actionToPath({ type: 'MISSED' }, routesMap)
    expect(performMatch).toThrowError()

    performMatch = () => actionToPath({ type: 'INFO' }, routesMap)
    expect(performMatch).not.toThrowError()
  })
})


describe('changePageTitle()', () => {
  it('when title changes set it to document.title', () => {
    const document = { }
    const title = 'foo'

    const ret = changePageTitle(document, title)

    console.log(document)

    expect(document).toEqual({ title: 'foo' })
    expect(ret).toEqual('foo')
  })

  it('when title changes do not set document.title', () => {
    const document = { title: 'foo' }
    const title = 'foo'

    const ret = changePageTitle(document, title)

    console.log(document)

    expect(document).toEqual({ title: 'foo' })
    expect(ret).toEqual(null) // no return value when title does not change
  })
})
